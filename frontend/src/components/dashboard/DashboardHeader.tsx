"use client";

import { Card, CardContent } from "@/components/ui/card";

/**
 * Simple greeting banner on the dashboard.
 */
export default function DashboardHeader() {
    return (
        // <Card className="shadow-sm">
        //     <CardContent className="py-2">
        <div className="text-sm text-muted-foreground">
            Hello, Admin! Welcome to Loger Dashboard.
        </div>
        //     </CardContent>
        // </Card>
    );
}