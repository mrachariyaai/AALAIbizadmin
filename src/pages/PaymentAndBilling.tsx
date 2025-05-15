
import { PageLayout } from "@/components/common/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, FileText, Filter, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { toast } from "sonner";

// Sample data for invoices
const invoices = [
  {
    id: "INV-001",
    date: "2025-05-01",
    client: "ABC Company",
    amount: "$1,200.00",
    status: "paid",
  },
  {
    id: "INV-002",
    date: "2025-05-06",
    client: "XYZ Corporation",
    amount: "$850.00",
    status: "pending",
  },
  {
    id: "INV-003",
    date: "2025-05-10",
    client: "Global Enterprises",
    amount: "$3,200.00",
    status: "paid",
  },
  {
    id: "INV-004",
    date: "2025-05-15",
    client: "Local Business Ltd",
    amount: "$450.00",
    status: "overdue",
  },
  {
    id: "INV-005",
    date: "2025-05-20",
    client: "Tech Solutions Inc",
    amount: "$1,800.00",
    status: "pending",
  },
];

// Sample data for payment methods
const paymentMethods = [
  {
    id: 1,
    type: "Credit Card",
    name: "Visa ending in 4242",
    default: true,
    expiry: "07/26",
  },
  {
    id: 2,
    type: "Credit Card",
    name: "Mastercard ending in 8888",
    default: false,
    expiry: "02/27",
  },
  {
    id: 3,
    type: "Bank Account",
    name: "Business Checking - First National",
    default: false,
    expiry: "N/A",
  },
];

export default function PaymentAndBilling() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-500">Paid</Badge>;
      case "pending":
        return <Badge variant="outline" className="border-yellow-500 text-yellow-500">Pending</Badge>;
      case "overdue":
        return <Badge variant="destructive">Overdue</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleAddPaymentMethod = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Payment method added successfully");
    setIsDialogOpen(false);
  };

  const handleDownloadInvoice = (id: string) => {
    toast.success(`Downloading invoice ${id}`);
  };

  return (
    <PageLayout title="Payment & Billing">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Payment Methods Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>Manage your payment methods</CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" /> Add Method
                </Button>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={handleAddPaymentMethod}>
                  <DialogHeader>
                    <DialogTitle>Add Payment Method</DialogTitle>
                    <DialogDescription>
                      Add a new payment method to your account
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="paymentType" className="text-right">Type</Label>
                      <Select required>
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="creditCard">Credit Card</SelectItem>
                          <SelectItem value="bankAccount">Bank Account</SelectItem>
                          <SelectItem value="paypal">PayPal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="cardNumber" className="text-right">Card Number</Label>
                      <Input id="cardNumber" className="col-span-3" placeholder="**** **** **** ****" required />
                    </div>
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="cardName" className="text-right">Name on Card</Label>
                      <Input id="cardName" className="col-span-3" required />
                    </div>
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label className="text-right">Expiry</Label>
                      <div className="col-span-3 flex gap-2">
                        <Select required>
                          <SelectTrigger className="w-[80px]">
                            <SelectValue placeholder="MM" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 12 }, (_, i) => {
                              const month = i + 1;
                              return (
                                <SelectItem key={month} value={month.toString().padStart(2, '0')}>
                                  {month.toString().padStart(2, '0')}
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                        
                        <Select required>
                          <SelectTrigger className="w-[80px]">
                            <SelectValue placeholder="YY" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 10 }, (_, i) => {
                              const year = new Date().getFullYear() + i;
                              return (
                                <SelectItem key={year} value={year.toString().slice(-2)}>
                                  {year.toString().slice(-2)}
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                        
                        <Input className="w-[80px]" placeholder="CVC" maxLength={4} required />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="makeDefault" className="text-right">Make Default</Label>
                      <div className="col-span-3">
                        <input type="checkbox" id="makeDefault" />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                    <Button type="submit">Add Method</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {paymentMethods.map((method) => (
                <div key={method.id} className="flex items-center justify-between border rounded-md p-4">
                  <div>
                    <div className="font-medium flex items-center">
                      {method.type === "Credit Card" ? (
                        <span className="bg-primary/10 p-1 rounded mr-2">
                          <FileText className="h-4 w-4 text-primary" />
                        </span>
                      ) : (
                        <span className="bg-muted p-1 rounded mr-2">
                          <FileText className="h-4 w-4" />
                        </span>
                      )}
                      {method.name}
                      {method.default && <Badge className="ml-2 bg-primary/20 text-primary">Default</Badge>}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Expires: {method.expiry}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                    {!method.default && (
                      <Button variant="outline" size="sm">
                        Make Default
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Billing Information Section */}
        <Card>
          <CardHeader>
            <CardTitle>Billing Information</CardTitle>
            <CardDescription>Manage your billing details and addresses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border rounded-md p-4">
                <div className="flex justify-between mb-2">
                  <div className="font-medium">Billing Address</div>
                  <Button variant="ghost" size="sm">Edit</Button>
                </div>
                <div className="text-sm">
                  <p>AALAI Business Solutions Inc.</p>
                  <p>123 Tech Street</p>
                  <p>San Francisco, CA 94107</p>
                  <p>United States</p>
                </div>
              </div>
              
              <div className="border rounded-md p-4">
                <div className="flex justify-between mb-2">
                  <div className="font-medium">Billing Contact</div>
                  <Button variant="ghost" size="sm">Edit</Button>
                </div>
                <div className="text-sm">
                  <p>John Smith</p>
                  <p>finance@aalai-solutions.com</p>
                  <p>+1 (555) 123-4567</p>
                </div>
              </div>
              
              <div className="border rounded-md p-4">
                <div className="flex justify-between mb-2">
                  <div className="font-medium">Tax Information</div>
                  <Button variant="ghost" size="sm">Edit</Button>
                </div>
                <div className="text-sm">
                  <p>Tax ID: US-9876543210</p>
                  <p>VAT Number: Not applicable</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Invoices Section */}
      <Card className="mt-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Invoice History</CardTitle>
            <CardDescription>View and download your past invoices</CardDescription>
          </div>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.id}</TableCell>
                  <TableCell>{invoice.date}</TableCell>
                  <TableCell>{invoice.client}</TableCell>
                  <TableCell>{invoice.amount}</TableCell>
                  <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleDownloadInvoice(invoice.id)}>
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Subscription Section */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Current Subscription</CardTitle>
          <CardDescription>Manage your subscription plan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md p-6 bg-primary/5">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold">Enterprise Plan</h3>
                <p className="text-muted-foreground">Billed annually</p>
              </div>
              <Badge className="bg-primary">Active</Badge>
            </div>
            
            <div className="mb-6">
              <p className="text-3xl font-bold mb-2">$499<span className="text-base font-normal text-muted-foreground">/month</span></p>
              <p className="text-sm text-muted-foreground">Next payment on June 15, 2025: $5,988.00</p>
            </div>
            
            <div className="space-y-2 mb-6">
              <h4 className="font-medium">Plan features:</h4>
              <ul className="space-y-1 text-sm">
                <li className="flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13.3334 4L6.00002 11.3333L2.66669 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                  </svg>
                  <span>Unlimited users</span>
                </li>
                <li className="flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13.3334 4L6.00002 11.3333L2.66669 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                  </svg>
                  <span>Unlimited services</span>
                </li>
                <li className="flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13.3334 4L6.00002 11.3333L2.66669 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                  </svg>
                  <span>Advanced analytics</span>
                </li>
                <li className="flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13.3334 4L6.00002 11.3333L2.66669 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                  </svg>
                  <span>24/7 priority support</span>
                </li>
                <li className="flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13.3334 4L6.00002 11.3333L2.66669 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                  </svg>
                  <span>Custom integrations</span>
                </li>
              </ul>
            </div>
            
            <div className="flex space-x-3">
              <Button>Change Plan</Button>
              <Button variant="outline">Cancel Subscription</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </PageLayout>
  );
}
