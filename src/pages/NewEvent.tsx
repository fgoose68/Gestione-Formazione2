import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Select, SelectItem } from '@/components/ui';
import { Calendar, MapPin } from 'lucide-react';

const NewEvent = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    courseType: '',
    // altri campi del form
  });

  const handleCourseTypeChange = (value: string) => {
    setFormData({
      ...formData,
      courseType: value,
      // Se è e-learning, svuota il campo location
      location: value === 'e-learning' ? 'Online' : formData.location
    });
  };

  return (
    <div className="container mx-auto p-6">
      <form>
        {/* Altri campi del form */}
        
        <div className="mb-4">
          <label className="block mb-2">Tipo di corso</label>
          <Select 
            value={formData.courseType}
            onValueChange={handleCourseTypeChange}
          >
            <SelectItem value="presenza">In presenza</SelectItem>
            <SelectItem value="e-learning">E-learning</SelectItem>
            <SelectItem value="ibrido">Ibrido</SelectItem>
          </Select>
        </div>

        <div className="mb-4">
          <label className="block mb-2">Luogo</label>
          <Input
            icon={<MapPin />}
            placeholder={formData.courseType === 'e-learning' ? 'Online' : 'Inserisci il luogo'}
            value={formData.location}
            onChange={(e) => setFormData({...formData, location: e.target.value})}
            disabled={formData.courseType === 'e-learning'}
            className="w-full"
          />
        </div>

        {/* Altri campi del form */}
      </form>
    </div>
  );
};

export default NewEvent;