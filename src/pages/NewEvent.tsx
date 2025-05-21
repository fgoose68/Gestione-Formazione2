import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button'; // Import corretto
import { Input } from '@/components/ui/input'; // Import corretto
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'; // Import corretto per Select e componenti correlati
import { Calendar, MapPin } from 'lucide-react';

const NewEvent = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    courseType: '',
  });

  const handleCourseTypeChange = (value: string) => {
    setFormData({
      ...formData,
      courseType: value,
      location: value === 'e-learning' ? 'Online' : formData.location
    });
  };

  return (
    <div className="container mx-auto p-6">
      <form>
        {/* Other form fields */}
        
        <div className="mb-4">
          <label className="block mb-2">Tipo di corso</label>
          <Select onValueChange={handleCourseTypeChange} value={formData.courseType}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Seleziona il tipo di corso" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="presenza">In presenza</SelectItem>
              <SelectItem value="e-learning">E-learning</SelectItem>
              <SelectItem value="ibrido">Ibrido</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="mb-4">
          <label className="block mb-2">Luogo</label>
          <Input
            value={formData.location}
            onChange={(e) => setFormData({...formData, location: e.target.value})}
            disabled={formData.courseType === 'e-learning'}
            className="w-full"
          />
        </div>

        {/* Other form fields */}
      </form>
    </div>
  );
};

export default NewEvent;