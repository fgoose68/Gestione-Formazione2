import { Calendar, MapPin, User, Users, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar as CalendarUI } from "@/components/ui/calendar";
import { useState } from "react";
import { DateRange } from "react-day-picker";
import { useNavigate } from "react-router-dom";

const NewEvent = () => {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    teacher: "",
    students: ""
  });

  const handleSubmit = async () => {
    // Handle form submission logic here
    navigate("/");
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold text-blue-800 mb-6">Create New Training Event</h1>
      <div className="bg-white rounded-lg shadow-md p-6">
        {/* Form content */}
      </div>
    </div>
  );
};

export default NewEvent;