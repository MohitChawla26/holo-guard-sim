import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const DashboardIndex = () => {
  const navigate = useNavigate();
  useEffect(() => {
    navigate("/dashboard/attack-analyzer", { replace: true });
  }, [navigate]);
  return null;
};

export default DashboardIndex;
