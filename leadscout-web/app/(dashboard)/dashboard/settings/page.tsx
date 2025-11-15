"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { toast } from "sonner";
import { LEAD_CATEGORIES } from "@/lib/constants";

export default function SettingsPage() {
  const company = useQuery(api.queries.companies.getCurrentUser);
  const updateProfile = useMutation(api.mutations.companies.updateProfile);
  const updatePreferences = useMutation(api.mutations.companies.updatePreferences);

  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    companyName: "",
    website: "",
    industry: "",
    teamSize: "",
  });

  const [preferences, setPreferences] = useState({
    categories: [] as string[],
    budgetMin: 0,
    budgetMax: 100000,
    notifications: {
      newLeads: true,
      lowCredits: true,
      renewalReminder: true,
    },
  });

  // Initialize form data when company loads
  if (company && !profileData.companyName) {
    setProfileData({
      companyName: company.profile?.companyName || "",
      website: company.profile?.website || "",
      industry: company.profile?.industry || "",
      teamSize: company.profile?.teamSize || "",
    });
    setPreferences({
      categories: company.preferences?.categories || [],
      budgetMin: company.preferences?.budgetMin || 0,
      budgetMax: company.preferences?.budgetMax || 100000,
      notifications: company.preferences?.notifications || {
        newLeads: true,
        lowCredits: true,
        renewalReminder: true,
      },
    });
  }

  if (company === undefined) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      await updateProfile(profileData);
      toast.success("Profile updated successfully");
    } catch (error: any) {
      toast.error("Failed to update profile", {
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePreferences = async () => {
    setIsLoading(true);
    try {
      await updatePreferences(preferences);
      toast.success("Preferences updated successfully");
    } catch (error: any) {
      toast.error("Failed to update preferences", {
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCategory = (category: string) => {
    setPreferences((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category],
    }));
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">Company Profile</TabsTrigger>
          <TabsTrigger value="preferences">Lead Preferences</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        {/* Company Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={profileData.companyName}
                    onChange={(e) =>
                      setProfileData((prev) => ({
                        ...prev,
                        companyName: e.target.value,
                      }))
                    }
                    placeholder="Acme Corp"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    value={profileData.website}
                    onChange={(e) =>
                      setProfileData((prev) => ({
                        ...prev,
                        website: e.target.value,
                      }))
                    }
                    placeholder="https://acme.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Select
                    value={profileData.industry}
                    onValueChange={(value) =>
                      setProfileData((prev) => ({ ...prev, industry: value }))
                    }
                  >
                    <SelectTrigger id="industry">
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="IT Services">IT Services</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                      <SelectItem value="Consulting">Consulting</SelectItem>
                      <SelectItem value="Finance">Finance</SelectItem>
                      <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                      <SelectItem value="Retail">Retail</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="teamSize">Company Size</Label>
                  <Select
                    value={profileData.teamSize}
                    onValueChange={(value) =>
                      setProfileData((prev) => ({ ...prev, teamSize: value }))
                    }
                  >
                    <SelectTrigger id="teamSize">
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-10">1-10 employees</SelectItem>
                      <SelectItem value="11-50">11-50 employees</SelectItem>
                      <SelectItem value="51-200">51-200 employees</SelectItem>
                      <SelectItem value="201-500">201-500 employees</SelectItem>
                      <SelectItem value="501+">501+ employees</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="pt-4">
                <Button onClick={handleSaveProfile} disabled={isLoading}>
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Lead Preferences Tab */}
        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Preferred Lead Categories</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Select categories you're interested in to receive relevant lead
                notifications
              </p>
              <div className="grid gap-3 md:grid-cols-2">
                {LEAD_CATEGORIES.map((category) => (
                  <div key={category} className="flex items-center space-x-2">
                    <Checkbox
                      id={category}
                      checked={preferences.categories.includes(category)}
                      onCheckedChange={() => toggleCategory(category)}
                    />
                    <Label
                      htmlFor={category}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {category}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Budget Range</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Filter leads by budget range
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="budgetMin">Minimum Budget (€)</Label>
                  <Input
                    id="budgetMin"
                    type="number"
                    value={preferences.budgetMin}
                    onChange={(e) =>
                      setPreferences((prev) => ({
                        ...prev,
                        budgetMin: parseInt(e.target.value) || 0,
                      }))
                    }
                    min={0}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="budgetMax">Maximum Budget (€)</Label>
                  <Input
                    id="budgetMax"
                    type="number"
                    value={preferences.budgetMax}
                    onChange={(e) =>
                      setPreferences((prev) => ({
                        ...prev,
                        budgetMax: parseInt(e.target.value) || 100000,
                      }))
                    }
                    min={0}
                  />
                </div>
              </div>

              <div className="pt-4">
                <Button onClick={handleSavePreferences} disabled={isLoading}>
                  {isLoading ? "Saving..." : "Save Preferences"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Notifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="newLeads">New Matching Leads</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when new leads match your preferences
                  </p>
                </div>
                <Checkbox
                  id="newLeads"
                  checked={preferences.notifications.newLeads}
                  onCheckedChange={(checked) =>
                    setPreferences((prev) => ({
                      ...prev,
                      notifications: {
                        ...prev.notifications,
                        newLeads: !!checked,
                      },
                    }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="lowCredits">Low Credits Alert</Label>
                  <p className="text-sm text-muted-foreground">
                    Alert when you're running low on credits
                  </p>
                </div>
                <Checkbox
                  id="lowCredits"
                  checked={preferences.notifications.lowCredits}
                  onCheckedChange={(checked) =>
                    setPreferences((prev) => ({
                      ...prev,
                      notifications: {
                        ...prev.notifications,
                        lowCredits: !!checked,
                      },
                    }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="renewalReminder">Renewal Reminder</Label>
                  <p className="text-sm text-muted-foreground">
                    Reminder before your subscription renews
                  </p>
                </div>
                <Checkbox
                  id="renewalReminder"
                  checked={preferences.notifications.renewalReminder}
                  onCheckedChange={(checked) =>
                    setPreferences((prev) => ({
                      ...prev,
                      notifications: {
                        ...prev.notifications,
                        renewalReminder: !!checked,
                      },
                    }))
                  }
                />
              </div>

              <div className="pt-4">
                <Button onClick={handleSavePreferences} disabled={isLoading}>
                  {isLoading ? "Saving..." : "Save Preferences"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
