import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Lock } from "lucide-react";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "";
      const response = await fetch(`${apiUrl}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        login(data.token);
        toast.success("Login successful");
        navigate("/");
      } else {
        toast.error("Invalid credentials");
      }
    } catch (error) {
      toast.error("Failed to connect to backend");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-sm space-y-8 bg-card p-8 rounded-xl shadow-lg border">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Shopkeeper Login</h1>
          <p className="text-sm text-muted-foreground mt-2">Enter credentials to access Cashbook</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Username</label>
            <Input 
              type="text" 
              placeholder="Enter username" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)}
              className="h-12"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Password</label>
            <Input 
              type="password" 
              placeholder="••••••••" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              className="h-12"
              required
            />
          </div>
          <Button 
            type="submit" 
            className="w-full h-12 text-md mt-4" 
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>
      </div>
    </div>
  );
}
