import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useHistory } from "../hooks/useCashbook";
import { getDb } from "../lib/firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { FileText, Download } from "lucide-react";

interface ReportFile {
  id: string;
  fileName: string;
  driveLink: string;
  dateRange: string;
  createdAt: any;
}

export default function Reports() {
  const { token } = useAuth();
  const { transactions, loading: loadingTx } = useHistory();
  const [reports, setReports] = useState<ReportFile[]>([]);
  const [loadingReports, setLoadingReports] = useState(true);
  
  const [reportType, setReportType] = useState<"daily" | "monthly" | "custom">("daily");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const db = getDb();
    const q = query(collection(db, "reports"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ReportFile[];
      setReports(data);
      setLoadingReports(false);
    }, (error) => {
      console.error("Failed to fetch reports metadata:", error);
      setLoadingReports(false);
    });

    return () => unsubscribe();
  }, []);

  const handleGenerate = async () => {
    // Auth temporarily bypassed
    // if (!token) return;
    
    if (reportType === "custom" && (!startDate || !endDate)) {
      toast.error("Please select start and end dates");
      return;
    }

    setGenerating(true);

    try {
      const now = new Date();
      let filteredTx = transactions;
      let title = "";
      let dateRange = "";

      if (reportType === "daily") {
        title = "Daily Report";
        dateRange = now.toLocaleDateString();
        filteredTx = transactions.filter(t => {
          const d = new Date(t.timestamp);
          return d.getDate() === now.getDate() && 
                 d.getMonth() === now.getMonth() && 
                 d.getFullYear() === now.getFullYear();
        });
      } else if (reportType === "monthly") {
        title = "Monthly Report";
        dateRange = `${now.toLocaleString('default', { month: 'long' })} ${now.getFullYear()}`;
        filteredTx = transactions.filter(t => {
          const d = new Date(t.timestamp);
          return d.getMonth() === now.getMonth() && 
                 d.getFullYear() === now.getFullYear();
        });
      } else if (reportType === "custom") {
        title = "Custom Range Report";
        dateRange = `${startDate} to ${endDate}`;
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filteredTx = transactions.filter(t => {
          const d = new Date(t.timestamp);
          return d >= start && d <= end;
        });
      }

      if (filteredTx.length === 0) {
        toast.error("No data available for selected range");
        setGenerating(false);
        return;
      }

      let incoming = 0;
      let outgoing = 0;

      filteredTx.forEach(tx => {
        const isCashIn = ["Income", "Udhaar Payment Received"].includes(tx.type);
        const isCashOut = ["Expense", "Merchant Payment Made", "Udhaar Given"].includes(tx.type);
        
        if (isCashIn) incoming += tx.amount;
        if (isCashOut) outgoing += tx.amount;
      });

      const payload = {
        title,
        dateRange,
        reportType,
        summary: {
          incoming,
          outgoing,
          net: incoming - outgoing
        },
        transactions: filteredTx
      };

      const apiUrl = import.meta.env.VITE_API_URL || "";
      const response = await fetch(`${apiUrl}/api/pdf/generate`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          // "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Report generated and saved!");
        
        // Trigger automatic download
        const a = document.createElement("a");
        a.href = data.url;
        a.target = "_blank";
        a.download = data.fileName;
        document.body.appendChild(a);
        a.click();
        a.remove();
        
      } else {
        toast.error(data.error || "Failed to generate report");
      }
    } catch (error) {
      console.error(error);
      toast.error("Network error connecting to backend");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <FileText className="w-6 h-6 text-blue-600" />
        <h1 className="text-2xl font-bold">PDF Reports</h1>
      </div>

      <Card className="p-4 space-y-4">
        <h2 className="font-semibold text-lg">Generate New Report</h2>
        <Select value={reportType} onValueChange={(val: any) => setReportType(val)}>
          <SelectTrigger className="h-12 bg-muted/50">
            <SelectValue placeholder="Select Report Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Daily Summary</SelectItem>
            <SelectItem value="monthly">Monthly Summary</SelectItem>
            <SelectItem value="custom">Custom Date Range</SelectItem>
          </SelectContent>
        </Select>

        {reportType === "custom" && (
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Start Date</label>
              <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">End Date</label>
              <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
            </div>
          </div>
        )}
        
        <Button 
          className="w-full h-12" 
          onClick={handleGenerate}
          disabled={generating || loadingTx}
        >
          {generating ? "Generating..." : "Generate & Save PDF"}
        </Button>
      </Card>

      <div className="space-y-4 pb-20">
        <h2 className="font-semibold text-lg">Cloud Saved Reports</h2>
        {loadingReports ? (
          <div className="text-center text-muted-foreground">Loading PDFs...</div>
        ) : reports.length === 0 ? (
          <div className="text-center text-muted-foreground py-8 border-2 border-dashed rounded-lg">
            No reports saved in cloud yet.
          </div>
        ) : (
          <div className="space-y-2">
            {reports.map((report) => (
              <Card key={report.id} className="p-3 flex justify-between items-center">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium truncate max-w-[180px]">
                      {report.fileName}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground ml-6">
                    {report.dateRange}
                  </span>
                </div>
                <Button asChild variant="outline" size="sm">
                  <a href={report.driveLink} target="_blank" rel="noopener noreferrer">
                    <Download className="w-4 h-4 mr-2" /> View
                  </a>
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
