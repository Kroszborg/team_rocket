"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export function CreativeTesterHeader() {
  const router = useRouter();

  return (
    <div className="mb-8">
      <div className="flex items-center space-x-4 mb-4">
        <Button variant="default" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Badge variant="outline">Creative Scorer</Badge>
      </div>
      <h1 className="text-3xl font-bold">Ad Copy Performance Analyzer</h1>
      <p className="text-lg text-muted-foreground mt-2">
        Test and optimize your ad copy with AI-powered insights before launching
        your campaign
      </p>
    </div>
  );
}
