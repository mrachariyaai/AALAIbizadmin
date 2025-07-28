import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/common/Logo";
import { Phone, CheckCircle, QrCode, RefreshCw, Smartphone } from "lucide-react";
import { isValidPhoneNumber } from "@/utils/authUtils";
import { signIn, confirmSignIn, getCurrentUser } from 'aws-amplify/auth';
import QRCode from "react-qr-code";
import { checkQRScanStatus, completeQRLogin, fetchQRSessionId } from "@/api/auth";
import { Hub } from "aws-amplify/utils";

// Country codes with flags and dial codes
const COUNTRIES = [
  // { code: "US", name: "United States", dialCode: "+1", flag: "🇺🇸" },
  { code: "IN", name: "India", dialCode: "+91", flag: "🇮🇳" },
  // { code: "GB", name: "United Kingdom", dialCode: "+44", flag: "🇬🇧" },
  // { code: "CA", name: "Canada", dialCode: "+1", flag: "🇨🇦" },
  // { code: "AU", name: "Australia", dialCode: "+61", flag: "🇦🇺" },
  // { code: "DE", name: "Germany", dialCode: "+49", flag: "🇩🇪" },
  // { code: "FR", name: "France", dialCode: "+33", flag: "🇫🇷" },
  // { code: "JP", name: "Japan", dialCode: "+81", flag: "🇯🇵" },
  // { code: "CN", name: "China", dialCode: "+86", flag: "🇨🇳" },
  // { code: "BR", name: "Brazil", dialCode: "+55", flag: "🇧🇷" },
  // { code: "MX", name: "Mexico", dialCode: "+52", flag: "🇲🇽" },
  // { code: "SG", name: "Singapore", dialCode: "+65", flag: "🇸🇬" },
  // { code: "AE", name: "UAE", dialCode: "+971", flag: "🇦🇪" },
  // { code: "SA", name: "Saudi Arabia", dialCode: "+966", flag: "🇸🇦" },
  // { code: "ZA", name: "South Africa", dialCode: "+27", flag: "🇿🇦" },
];

export function LoginForm() {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loginType, setLoginType] = useState<'phone' | 'qr'>('phone');
  const [selectedCountry, setSelectedCountry] = useState("IN");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpNextStep, setOtpNextStep] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  
  // QR Code related state
  const [qrCode, setQrCode] = useState("");
  const [qrSessionId, setQrSessionId] = useState("");
  const [isQrLoading, setIsQrLoading] = useState(false);

  const qrPollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [qrExpiryTimeout, setQrExpiryTimeout] = useState<NodeJS.Timeout | null>(null);
  const [qrExpired, setQrExpired] = useState(false);

  const { toast } = useToast();
  const navigate = useNavigate();

  const selectedCountryData = COUNTRIES.find(country => country.code === selectedCountry);
  const fullPhoneNumber = `${selectedCountryData?.dialCode}${phoneNumber}`;

  // Clear QR expiry timeout
  const clearQRExpiryTimeout = () => {
    if (qrExpiryTimeout) {
      clearTimeout(qrExpiryTimeout);
      setQrExpiryTimeout(null);
    }
  };

  // Generate QR Code for login
  const generateQRCode = async () => {
    setIsQrLoading(true);
    setQrExpired(false);
    
    // Clear any existing expiry timeout
    clearQRExpiryTimeout();
    
    try {
      // Get a sessionid from backend
      const sessionId: string = await fetchQRSessionId()
      if (sessionId === "") {
        throw new Error("Error generating QR Code")
      }
      setQrSessionId(sessionId);
      
      // Create QR code data with additional metadata
      const qrData = JSON.stringify({
        type: 'AALAI_LOGIN',
        sessionId: sessionId,
        timestamp: Date.now(),
        expiresAt: Date.now() + (5 * 60 * 1000) // 5 minutes from now
      });
      
      setQrCode(qrData);
      
      // Stop previous polling if any
      stopQRPolling();
      
      // Start polling for QR code scan status
      startQRPolling(sessionId);
      
      // Set QR code expiry (5 minutes) and store the timeout reference
      const timeout = setTimeout(() => {
        setQrExpired(true);
        stopQRPolling();
        setQrExpiryTimeout(null); // Clear the reference
      }, 5 * 60 * 1000);
      
      setQrExpiryTimeout(timeout);
      
    } catch (error) {
      console.error("Error generating QR code:", error);
      toast({
        title: "Error",
        description: "Failed to generate QR code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsQrLoading(false);
    }
  };

  // Start polling to check if QR code has been scanned
  const startQRPolling = async (sessionId: string) => {
    
    const interval = setInterval(async () => {
      try {
        // Check the backend for scan status
        const data = await checkQRScanStatus(sessionId);
        
        // If the QR code is linked a user, stop polling
        if (data.status === 'linked') {
          
          // Stop polling and clear expiry timeout
          stopQRPolling();
          clearQRExpiryTimeout();
          setQrExpired(false);

          // Complete the QR code login process
          const res = await completeQRLogin(sessionId);
          if (res.status === 'success') {
            toast({
              title: "Login Successful",
              description: "You have logged in via QR code",
            });

            // manually notify about signin
            Hub.dispatch('auth', { event: 'signedIn' });

            const user = await getCurrentUser();
            console.log("User logged in via QR code:", user);
          }
          else {
            toast({
              title: "Login Failed",
              description: "Failed to complete QR code login. Please try again.",
              variant: "destructive",
            });
          }
        }
      } catch (error) {
        console.error("QR polling error:", error);
      }
    }, 2000); // Poll every 2 seconds

    // Store the interval ID
    qrPollingIntervalRef.current = interval;

  };

  // Stop QR code polling
  const stopQRPolling = () => {
    if (qrPollingIntervalRef.current) {
      clearInterval(qrPollingIntervalRef.current);
      qrPollingIntervalRef.current = null;
    }
  };

  // Cleanup function for all timers and intervals
  const cleanupQRResources = () => {
    stopQRPolling();
    clearQRExpiryTimeout();
  };

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      cleanupQRResources();
    };
  }, []);

  // Generate QR code on component mount and when switching to QR mode
  useEffect(() => {
    if (loginType === 'qr') {
      generateQRCode();
    } else {
      // Clean up QR resources when switching away from QR mode
      cleanupQRResources();
    }
  }, [loginType]);

  
  const sendOTP = async () => {
    // Validate phone number
    if (!isValidPhoneNumber(phoneNumber.trim())) {
      toast({
        title: "Invalid phone number",
        description: "Please enter a valid phone number",
        variant: "destructive",
      });
      return;
    }

    // Send OTP 
    setIsLoading(true);
    try {
      const { nextStep } = await signIn({
        username: fullPhoneNumber,
        options: {
          authFlowType: 'CUSTOM_WITHOUT_SRP', // Use custom auth flow for OTP
        }
      });
      
      // Next step in auth challenge
      setOtpNextStep(nextStep.signInStep);

      // OTP sent successfully, set the next step as otp
      setOtpSent(true);
      setStep('otp');
      
    } catch (error) {
      console.error("Error sending OTP:", error.message);
      
      // Check if `NotAuthorizedException` is included in the error message
      let errorDescription = "Something went wrong. Please try again."
      if (error.message.includes('Incorrect username or password')) {
        errorDescription = "Invalid phone number. Create an AALAI account in mobile app to use this feature";
      }
      toast({
        title: "Error",
        description: errorDescription,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOTP = async () => {


    if (!otp.trim()) {
      toast({
        title: "OTP required",
        description: "Please enter the verification code",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      
      if (otpNextStep === 'CONFIRM_SIGN_IN_WITH_CUSTOM_CHALLENGE') {

        // Send OTP to backend for verification
        const response = await confirmSignIn({
          challengeResponse: otp,
        });

        const user = await getCurrentUser();
        toast({
          title: "Login Successful",
          description: "You have been logged in successfully",
        });

        navigate("/dashboard");

      } else {
        toast({
          title: "Verification failed",
          description: "Create an account for AALAI to use this feature",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      toast({
        title: "Error",
        description: "Invalid OTP",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendOTP();
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await verifyOTP();
  };

  const goBackToPhone = () => {
    setStep('phone');
    setOtp("");
    setOtpSent(false);
  };

  const resendOTP = async () => {
    if (resendCooldown > 0) return;
    await sendOTP();
  };

  const refreshQRCode = () => {
    generateQRCode();
  };

  const toggleLoginType = () => {
    setLoginType(loginType === 'phone' ? 'qr' : 'phone');
    // Reset states when switching
    if (loginType === 'phone') {
      setStep('phone');
      setOtp("");
      setOtpSent(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Toggle Button */}
      <div className="mb-6 flex justify-center">
        <div className="relative bg-gray-100 rounded-lg p-1 flex">
          <button
            onClick={toggleLoginType}
            className={`relative px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 ease-in-out ${
              loginType === 'phone'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Phone className="w-4 h-4 mr-2 inline" />
            Phone Login
          </button>
          <button
            onClick={toggleLoginType}
            className={`relative px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 ease-in-out ${
              loginType === 'qr'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <QrCode className="w-4 h-4 mr-2 inline" />
            QR Code
          </button>
        </div>
      </div>

      {/* Animated Card Container */}
      <div className="relative overflow-hidden">
        <div 
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(${loginType === 'phone' ? '0%' : '-100%'})` }}
        >
          {/* Phone/OTP Login Card */}
          <Card className="w-full flex-shrink-0">
            <CardHeader className="space-y-1 flex flex-col items-center">
              <Logo className="h-12 w-auto mb-4" />
              <CardTitle className="text-2xl font-bold">
                {step === 'phone' ? 'Login with Phone' : 'Verify OTP'}
              </CardTitle>
              <CardDescription>
                {step === 'phone' 
                  ? 'Enter your mobile number to receive a verification code'
                  : `Enter the 6-digit code sent to ${fullPhoneNumber}`
                }
              </CardDescription>
            </CardHeader>

            <CardContent className="min-h-[300px] flex flex-col justify-center">
              {step === 'phone' ? (
                <form onSubmit={handlePhoneSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="phoneNumber" className="form-label">Mobile Number</label>
                    <div className="flex">
                      <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                        <SelectTrigger className="w-32 rounded-r-none border-r-0">
                          <SelectValue>
                            <div className="flex flex-1 items-center gap-1">
                              <span>{selectedCountryData?.flag}</span>
                              <span className="text-xs">{selectedCountryData?.dialCode}</span>
                            </div>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {COUNTRIES.map((country) => (
                            <SelectItem key={country.code} value={country.code}>
                              <div className="flex items-center gap-2">
                                <span>{country.flag}</span>
                                <span>{country.name}</span>
                                <span className="text-gray-500">({country.dialCode})</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        id="phoneNumber"
                        type="tel"
                        placeholder="Enter mobile number"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                        className="rounded-l-none flex-8"
                        required
                      />
                    </div>
                  </div>
                  
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    <Phone className="w-4 h-4 mr-2" />
                    {isLoading ? "Sending OTP..." : "Send OTP"}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleOtpSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="otp" className="form-label">Verification Code</label>
                    <Input
                      id="otp"
                      type="text"
                      placeholder="Enter 6-digit code"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="text-center text-lg tracking-widest"
                      maxLength={6}
                      required
                    />
                  </div>
                  
                  <div className="flex flex-col space-y-2">
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {isLoading ? "Verifying..." : "Verify & Login"}
                    </Button>
                    
                    <div className="flex justify-between items-center text-sm">
                      <button
                        type="button"
                        onClick={goBackToPhone}
                        className="text-primary hover:underline"
                      >
                        Change number
                      </button>
                      
                      <button
                        type="button"
                        onClick={resendOTP}
                        disabled={resendCooldown > 0}
                        className="text-primary hover:underline disabled:text-gray-400 disabled:no-underline"
                      >
                        {resendCooldown > 0 
                          ? `Resend in ${resendCooldown}s`
                          : "Resend OTP"
                        }
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-4">
              <div className="text-sm text-center text-gray-500">
                Contact your administrator for account access
              </div>
            </CardFooter>
          </Card>

          {/* QR Code Login Card */}
          <Card className="w-full flex-shrink-0">
            <CardHeader className="space-y-1 flex flex-col items-center">
              <Logo className="h-12 w-auto mb-4" />
              <CardTitle className="text-2xl font-bold">
                Login with QR Code
              </CardTitle>
              <CardDescription className="text-center">
                Scan the QR code with your AALAI mobile app to login instantly
              </CardDescription>
            </CardHeader>
            
            <CardContent className="min-h-[300px] flex flex-col items-center justify-center space-y-4">
              <div className="relative">
                {/* QR Code Display Area */}
                <div className="w-48 h-48 border-2 border-gray-200 rounded-lg flex items-center justify-center bg-white p-4">
                  {isQrLoading ? (
                    <div className="flex flex-col items-center space-y-2">
                      <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
                      <span className="text-sm text-gray-500">Generating...</span>
                    </div>
                  ) : qrExpired ? (
                    <div className="flex flex-col items-center space-y-2 text-center">
                      <QrCode className="w-8 h-8 text-gray-400" />
                      <span className="text-sm text-gray-500">QR Code Expired</span>
                      <Button size="sm" variant="outline" onClick={refreshQRCode}>
                        <RefreshCw className="w-4 h-4 mr-1" />
                        Refresh
                      </Button>
                    </div>
                  ) : qrCode ? (
                    <QRCode
                      value={qrCode}
                      size={180}
                      level="M"
                      bgColor="#FFFFFF"
                      fgColor="#000000"
                      className="border border-gray-100 rounded"
                    />
                  ) : null}
                </div>
                
                {/* Status indicator */}
                {!qrExpired && qrCode && (
                  <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  </div>
                )}
              </div>

              <div className="text-center space-y-2">
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                  <Smartphone className="w-4 h-4" />
                  <span>Open AALAI app and scan</span>
                </div>
                <p className="text-xs text-gray-500">
                  QR code expires in 5 minutes
                </p>
              </div>

              <Button 
                variant="outline" 
                size="sm" 
                onClick={refreshQRCode}
                disabled={isQrLoading}
                className="mt-4"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isQrLoading ? 'animate-spin' : ''}`} />
                Refresh QR Code
              </Button>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-4">
              <div className="text-sm text-center text-gray-500">
                Don't have the mobile app?{" "}
                <a href="#" className="text-primary hover:underline">
                  Download here
                </a>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}