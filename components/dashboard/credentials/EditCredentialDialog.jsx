"use client"
import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Combobox } from "@/components/ui/combobox"
import { fetchUserByCode } from '@/app/actions/fetchUserByCode'
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

export default function EditCredentialDialog({
  isOpen,
  onClose,
  formData,
  setFormData,
  packages,
  resellers,
  users,
  onSubmit
}) {
  const [isFetchingData, setIsFetchingData] = React.useState(false);

  // Transform resellers data for Combobox
  const resellerOptions = React.useMemo(() => 
    resellers?.map(reseller => ({
      value: reseller.customer_id.toString(),
      label: reseller.company_name
    })) || [], [resellers]
  )

  // Transform users data for Combobox
  const userOptions = React.useMemo(() => 
    users?.map(user => ({
      value: user.id.toString(),
      label: `${user.name} (${user.email})`
    })) || [], [users]
  )

  // Transform packages data for Combobox
  const packageOptions = React.useMemo(() => 
    packages?.map(pkg => ({
      value: pkg.id.toString(),
      label: pkg.name
    })) || [], [packages]
  )

  // Function to fetch user ID and reseller ID by code
  const fetchIdsByCode = React.useCallback(async (code) => {
    if (!code) return;
    
    setIsFetchingData(true);
    try {
      const result = await fetchUserByCode(code);
      if (result.success) {
        setFormData(prev => ({ 
          ...prev, 
          user_id: result.user_id?.toString() || "",
          reseller_id: result.reseller_id?.toString() || ""
        }));
      } else {
        // If no data is found for the code, clear the user_id and reseller_id fields
        setFormData(prev => ({ 
          ...prev, 
          user_id: "",
          reseller_id: ""
        }));
        toast.error(result.error || "Failed to fetch data for the provided code");
      }
    } catch (error) {
      console.error("Error fetching data by code:", error);
      setFormData(prev => ({ 
        ...prev, 
        user_id: "",
        reseller_id: ""
      }));
      toast.error("Error fetching data for the provided code");
    } finally {
      setIsFetchingData(false);
    }
  }, [setFormData]);

  // Handle code input change
  const handleCodeChange = React.useCallback((e) => {
    const code = e.target.value;
    setFormData(prev => ({ ...prev, code }));
    
    // Fetch user ID and reseller ID when code is entered (debounced)
    if (code) {
      // Clear any existing timeout
      if (handleCodeChange.timeoutId) {
        clearTimeout(handleCodeChange.timeoutId);
      }
      
      // Set new timeout
      handleCodeChange.timeoutId = setTimeout(() => {
        fetchIdsByCode(code);
        // Clear the timeout ID after execution
        handleCodeChange.timeoutId = null;
      }, 500);
    } else if (handleCodeChange.timeoutId) {
      // Clear timeout if code is empty
      clearTimeout(handleCodeChange.timeoutId);
      handleCodeChange.timeoutId = null;
    }
  }, [setFormData, fetchIdsByCode]);

  // Cleanup timeouts on unmount
  React.useEffect(() => {
    return () => {
      if (handleCodeChange.timeoutId) {
        clearTimeout(handleCodeChange.timeoutId);
      }
    };
  }, []);

  // Fetch user ID and reseller ID when dialog opens and there's already a code value
  React.useEffect(() => {
    if (isOpen && formData.code) {
      // Small delay to ensure component is fully mounted
      const timeoutId = setTimeout(() => {
        fetchIdsByCode(formData.code);
      }, 100);
      
      return () => clearTimeout(timeoutId);
    }
  }, [isOpen, formData.code, fetchIdsByCode]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Credential</DialogTitle>
          <DialogDescription>
            Modify the credential information.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Email</label>
            <Input
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="user@example.com"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Password</label>
            <Input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              placeholder="Enter password"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Package</label>
            <Combobox
              cities={packageOptions}
              value={formData.pkg_id}
              onValueChange={(value) => setFormData(prev => ({ ...prev, pkg_id: value }))}
              placeholder="Select package"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Reseller</label>
            <div className="relative">
              <Combobox
                cities={resellerOptions}
                value={formData.reseller_id || ""}
                onValueChange={(value) => setFormData(prev => ({ ...prev, reseller_id: value }))}
                placeholder="Select reseller"
                disabled={isFetchingData}
              />
              {isFetchingData && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              )}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">User</label>
            <div className="relative">
              <Combobox
                cities={userOptions}
                value={formData.user_id || ""}
                onValueChange={(value) => setFormData(prev => ({ ...prev, user_id: value }))}
                placeholder="Select user"
                disabled={isFetchingData}
              />
              {isFetchingData && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              )}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Quota (optional)</label>
            <Input
              type="number"
              value={formData.quota}
              onChange={(e) => setFormData(prev => ({ ...prev, quota: e.target.value }))}
              placeholder="Enter quota limit"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Code (optional)</label>
            <Input
              value={formData.code}
              onChange={handleCodeChange}
              placeholder="Enter code"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onSubmit}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}