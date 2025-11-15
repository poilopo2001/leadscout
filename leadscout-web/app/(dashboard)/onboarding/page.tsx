"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Logo } from "@/components/shared/Logo";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { LEAD_CATEGORIES } from "@/lib/constants";

export default function OnboardingPage() {
  const router = useRouter();
  const createCompany = useMutation(api.mutations.companies.create);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    companyName: "",
    website: "",
    industry: "",
    teamSize: "",
    categories: [] as string[],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (step === 1) {
      if (!formData.companyName || !formData.industry || !formData.teamSize) {
        toast.error("Please fill in all required fields");
        return;
      }
      setStep(2);
      return;
    }

    if (formData.categories.length === 0) {
      toast.error("Please select at least one category");
      return;
    }

    setIsLoading(true);
    try {
      await createCompany({
        companyName: formData.companyName,
        website: formData.website,
        industry: formData.industry,
        teamSize: formData.teamSize,
        preferredCategories: formData.categories,
      });

      toast.success("Welcome to LeadScout!", {
        description: "Your account is ready. Choose a plan to get started.",
      });

      router.push("/dashboard/subscription");
    } catch (error: any) {
      toast.error("Failed to complete onboarding", {
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCategory = (category: string) => {
    setFormData((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category],
    }));
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <Logo className="mx-auto mb-4" />
          <h1 className="text-3xl font-bold">Welcome to LeadScout</h1>
          <p className="text-muted-foreground mt-2">
            Let's set up your account to get you started
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div
            className={`h-2 w-20 rounded-full transition-colors ${
              step >= 1 ? "bg-primary" : "bg-muted"
            }`}
          />
          <div
            className={`h-2 w-20 rounded-full transition-colors ${
              step >= 2 ? "bg-primary" : "bg-muted"
            }`}
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {step === 1 ? "Company Information" : "Lead Preferences"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {step === 1 ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="companyName">
                      Company Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="companyName"
                      value={formData.companyName}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          companyName: e.target.value,
                        }))
                      }
                      placeholder="Acme Corp"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website">Website (Optional)</Label>
                    <Input
                      id="website"
                      type="url"
                      value={formData.website}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          website: e.target.value,
                        }))
                      }
                      placeholder="https://acme.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="industry">
                      Industry <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={formData.industry}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, industry: value }))
                      }
                      required
                    >
                      <SelectTrigger id="industry">
                        <SelectValue placeholder="Select your industry" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="IT Services">IT Services</SelectItem>
                        <SelectItem value="Marketing">Marketing</SelectItem>
                        <SelectItem value="Consulting">Consulting</SelectItem>
                        <SelectItem value="Finance">Finance</SelectItem>
                        <SelectItem value="Manufacturing">
                          Manufacturing
                        </SelectItem>
                        <SelectItem value="Retail">Retail</SelectItem>
                        <SelectItem value="Healthcare">Healthcare</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="teamSize">
                      Company Size <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={formData.teamSize}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, teamSize: value }))
                      }
                      required
                    >
                      <SelectTrigger id="teamSize">
                        <SelectValue placeholder="Select company size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-10">1-10 employees</SelectItem>
                        <SelectItem value="11-50">11-50 employees</SelectItem>
                        <SelectItem value="51-200">51-200 employees</SelectItem>
                        <SelectItem value="201-500">
                          201-500 employees
                        </SelectItem>
                        <SelectItem value="501+">501+ employees</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-4">
                    <Label>
                      Which types of leads are you interested in?{" "}
                      <span className="text-destructive">*</span>
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Select categories to receive relevant lead notifications
                    </p>
                    <div className="grid gap-3 md:grid-cols-2">
                      {LEAD_CATEGORIES.map((category) => (
                        <div
                          key={category}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={`onboard-${category}`}
                            checked={formData.categories.includes(category)}
                            onCheckedChange={() => toggleCategory(category)}
                          />
                          <Label
                            htmlFor={`onboard-${category}`}
                            className="text-sm font-normal cursor-pointer"
                          >
                            {category}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <div className="flex gap-3 pt-4">
                {step === 2 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="flex-1"
                  >
                    Back
                  </Button>
                )}
                <Button type="submit" className="flex-1" disabled={isLoading}>
                  {isLoading
                    ? "Setting up..."
                    : step === 1
                    ? "Next"
                    : "Complete Setup"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Step {step} of 2
        </p>
      </div>
    </div>
  );
}
