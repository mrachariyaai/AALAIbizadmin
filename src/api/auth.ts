
// BASE CLOUD URL
const BASE_AUTH_URL = import.meta.env.VITE_BASE_CLOUD_URL + "/auth"

// Function to genberate QR Code
export const fetchQRSessionId = async () => {
    
    try {
        const response = await fetch(BASE_AUTH_URL+"/generate-qr-session",{
            method: 'POST',
            body: JSON.stringify({})
        })
        const data = await response.json()
        return data.sessionId
    } catch (error) {
        console.log("FetchQR Error: ", error)
        return ""
    }
}

// Function to check the status of QR based login
export const checkQRScanStatus = async (sessionId:string) => {

    try {
        console.log("Session id: ", sessionId)
        const response = await fetch(`${BASE_AUTH_URL}/check-qr-session?sessionId=${sessionId}`, {
            method: 'GET',
        })
        const data = await response.json()
        console.log("QR status: ", data)
        return data
    } catch (error ) {
        console.log("Error fetching QR status")
        return {}
    }
}

// Function to complete the login process
export const completeQRLogin = async (sessionId: string) => {

    try {
        const response = await fetch(`${BASE_AUTH_URL}/complete-qr-login`, {
            method: 'POST',
            body: JSON.stringify({ sessionId })
        })
        const data = await response.json()
        console.log("QR Login completed: ", data)
        
        const now = Math.floor(Date.now() / 1000);
        const sessionData = {
            accessToken: {
                token: data.accessToken,
                expiresAt: now + 3600, // 1 hour from now
            },
            idToken: {
                token: data.idToken,
                expiresAt: now + 3600, // 1 hour from now
            },
            refreshToken: {
                token: data.refreshToken,
            },
            clockDrift: 0,
            signInDetails: {
                loginId: data.phoneNumber,
                authFlowType: "CUSTOM_WITHOUT_SRP"
            },
            LastAuthUser: data.userId
        };

        const issuedAt = JSON.parse(atob(data.idToken.split('.')[1])).iat;
        const clockDrift = Math.floor(Date.now() / 1000) - issuedAt;

        // Key used by Amplify to store session
        const storageKey = `CognitoIdentityServiceProvider.${data.clientId}.${data.userId}`;
        localStorage.setItem(`${storageKey}.signInDetails`, JSON.stringify(sessionData.signInDetails));
        localStorage.setItem(`${storageKey}.idToken`, sessionData.idToken.token);
        localStorage.setItem(`${storageKey}.accessToken`, sessionData.accessToken.token);
        localStorage.setItem(`${storageKey}.refreshToken`, sessionData.refreshToken.token);
        localStorage.setItem(`${storageKey}.clockDrift`, clockDrift.toString());
        localStorage.setItem(`CognitoIdentityServiceProvider.${data.clientId}.LastAuthUser`, sessionData.LastAuthUser);
        
        return {
            status: "success",
            data: sessionData
        }
    } catch (error) {
        console.log("Error completing QR login: ", error)
        return {
            status: "error",
            message: "Failed to complete QR login"
        }
    }
}