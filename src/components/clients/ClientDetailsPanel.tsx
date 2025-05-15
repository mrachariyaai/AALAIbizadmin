
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  FileText, 
  Building, 
  Package, 
  Check, 
  Mail, 
  Phone, 
  Globe, 
  MapPin,
  Clock
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Client } from "@/types/client";
import { Button } from "@/components/ui/button";

interface ClientDetailsPanelProps {
  client: Client;
  onEdit?: () => void;
}

export function ClientDetailsPanel({ client, onEdit }: ClientDetailsPanelProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="col-span-1">
        <CardHeader className="flex flex-row items-start justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Basic Information
          </CardTitle>
          {onEdit && (
            <Button variant="ghost" size="sm" onClick={onEdit}>
              Edit
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">{client.name}</h3>
              <p className="text-sm text-muted-foreground">Primary Contact</p>
            </div>
            
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <a href={`mailto:${client.email}`} className="text-sm hover:underline">
                {client.email}
              </a>
            </div>
            
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <a href={`tel:${client.phone}`} className="text-sm hover:underline">
                {client.phone}
              </a>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                Client since {new Date(client.activeSince).toLocaleDateString()}
              </span>
            </div>
            
            {client.notes && (
              <div className="pt-4 border-t">
                <h4 className="text-sm font-medium mb-1">Notes</h4>
                <p className="text-sm text-muted-foreground">{client.notes}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Company Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">{client.companyName}</h3>
              <p className="text-sm text-muted-foreground">{client.industry}</p>
            </div>
            
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{client.address}</span>
            </div>
            
            {client.website && (
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <a 
                  href={client.website.startsWith('http') ? client.website : `https://${client.website}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm hover:underline"
                >
                  {client.website.replace(/^https?:\/\//, '')}
                </a>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Subscription & Onboarding
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-medium mb-2">Subscription Plan</h4>
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <Badge className="text-sm">
                  {client.subscriptionTier}
                </Badge>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-2">Onboarding Status</h4>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-muted-foreground" />
                <Badge 
                  variant={client.onboardingStatus === 'Completed' ? 'default' : 
                         client.onboardingStatus === 'In Progress' ? 'secondary' :
                         client.onboardingStatus === 'On Hold' ? 'destructive' : 'outline'}>
                  {client.onboardingStatus}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
