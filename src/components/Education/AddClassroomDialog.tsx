import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Users, UserCheck } from "lucide-react";
import { toast } from "sonner";

interface User {
  id: number;
  name: string;
  email: string;
  role: "teacher" | "student";
}

interface Classroom {
  id?: number;
  name: string;
  description: string;
  subject: string;
  grade: string;
  capacity: number;
  teacherIds: number[];
  studentIds: number[];
}

interface AddClassroomDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  classroom?: Classroom;
  availableUsers?: User[];
}

// Mock data for available users
const mockUsers: User[] = [
  { id: 1, name: "John Smith", email: "john.smith@school.edu", role: "teacher" },
  { id: 2, name: "Sarah Johnson", email: "sarah.johnson@school.edu", role: "teacher" },
  { id: 3, name: "Mike Wilson", email: "mike.wilson@school.edu", role: "teacher" },
  { id: 4, name: "Emily Davis", email: "emily.davis@student.edu", role: "student" },
  { id: 5, name: "Alex Brown", email: "alex.brown@student.edu", role: "student" },
  { id: 6, name: "Lisa Chen", email: "lisa.chen@student.edu", role: "student" },
  { id: 7, name: "David Miller", email: "david.miller@student.edu", role: "student" },
  { id: 8, name: "Anna Taylor", email: "anna.taylor@student.edu", role: "student" },
];

export function AddClassroomDialog({ 
  isOpen, 
  onClose, 
  title, 
  classroom, 
  availableUsers = mockUsers 
}: AddClassroomDialogProps) {
  const [name, setName] = useState(classroom?.name || "");
  const [description, setDescription] = useState(classroom?.description || "");
  const [subject, setSubject] = useState(classroom?.subject || "");
  const [grade, setGrade] = useState(classroom?.grade || "");
  const [capacity, setCapacity] = useState(classroom?.capacity || 30);
  const [selectedTeachers, setSelectedTeachers] = useState<number[]>(classroom?.teacherIds || []);
  const [selectedStudents, setSelectedStudents] = useState<number[]>(classroom?.studentIds || []);
  const [teacherSearch, setTeacherSearch] = useState("");
  const [studentSearch, setStudentSearch] = useState("");

  const teachers = availableUsers.filter(user => user.role === "teacher");
  const students = availableUsers.filter(user => user.role === "student");

  const filteredTeachers = teachers.filter(teacher => 
    teacher.name.toLowerCase().includes(teacherSearch.toLowerCase()) ||
    teacher.email.toLowerCase().includes(teacherSearch.toLowerCase())
  );

  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
    student.email.toLowerCase().includes(studentSearch.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedTeachers.length === 0) {
      toast.error("Please assign at least one teacher to the classroom");
      return;
    }

    if (selectedStudents.length > capacity) {
      toast.error(`Number of students (${selectedStudents.length}) exceeds classroom capacity (${capacity})`);
      return;
    }

    const classroomData = {
      name,
      description,
      subject,
      grade,
      capacity,
      teacherIds: selectedTeachers,
      studentIds: selectedStudents,
    };

    console.log("Classroom Data:", classroomData);
    toast.success(
      classroom ? "Classroom updated successfully" : "Classroom created successfully"
    );

    onClose();
  };

  const addTeacher = (teacherId: number) => {
    if (!selectedTeachers.includes(teacherId)) {
      setSelectedTeachers([...selectedTeachers, teacherId]);
    }
  };

  const removeTeacher = (teacherId: number) => {
    setSelectedTeachers(selectedTeachers.filter(id => id !== teacherId));
  };

  const addStudent = (studentId: number) => {
    if (!selectedStudents.includes(studentId)) {
      setSelectedStudents([...selectedStudents, studentId]);
    }
  };

  const removeStudent = (studentId: number) => {
    setSelectedStudents(selectedStudents.filter(id => id !== studentId));
  };

  const getSelectedTeachers = () => {
    return teachers.filter(teacher => selectedTeachers.includes(teacher.id));
  };

  const getSelectedStudents = () => {
    return students.filter(student => selectedStudents.includes(student.id));
  };

  const subjectOptions = [
    "Mathematics", "Science", "English", "History", "Geography", 
    "Physics", "Chemistry", "Biology", "Computer Science", "Art"
  ];

  const gradeOptions = [
    "Kindergarten", "1st Grade", "2nd Grade", "3rd Grade", "4th Grade",
    "5th Grade", "6th Grade", "7th Grade", "8th Grade", "9th Grade",
    "10th Grade", "11th Grade", "12th Grade"
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {title}
            </DialogTitle>
            {/* <DialogDescription>
              Fill out the details below to {classroom ? "update" : "create"} a classroom and assign teachers and students.
            </DialogDescription> */}
          </DialogHeader>

          <div className="grid gap-6 py-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject *</Label>
                <Select value={subject} onValueChange={setSubject} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjectOptions.map(option => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity *</Label>
                <Input 
                  id="capacity" 
                  type="number"
                  value={capacity} 
                  onChange={(e) => setCapacity(parseInt(e.target.value) || 0)} 
                  min="1"
                  max="100"
                  required 
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                placeholder="Brief description..."
                rows={3}
              />
            </div>

            {/* Teacher Assignment */}
            {/* <div className="space-y-4">
              <div className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-blue-600" />
                <Label className="text-base font-semibold">Assign Teachers *</Label>
                <span className="text-sm text-gray-500">({selectedTeachers.length} selected)</span>
              </div>

              {selectedTeachers.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm text-gray-600">Selected Teachers:</Label>
                  <div className="flex flex-wrap gap-2">
                    {getSelectedTeachers().map(teacher => (
                      <Badge key={teacher.id} variant="secondary" className="flex items-center gap-1">
                        {teacher.name}
                        <X 
                          className="h-3 w-3 cursor-pointer hover:text-red-500" 
                          onClick={() => removeTeacher(teacher.id)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Input 
                  placeholder="Search teachers..." 
                  value={teacherSearch}
                  onChange={(e) => setTeacherSearch(e.target.value)}
                />
                <div className="max-h-32 overflow-y-auto border rounded-md">
                  {filteredTeachers.filter(teacher => !selectedTeachers.includes(teacher.id)).map(teacher => (
                    <div 
                      key={teacher.id} 
                      className="flex items-center justify-between p-2 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                      onClick={() => addTeacher(teacher.id)}
                    >
                      <div>
                        <div className="font-medium">{teacher.name}</div>
                        <div className="text-sm text-gray-500">{teacher.email}</div>
                      </div>
                      <Plus className="h-4 w-4 text-green-600" />
                    </div>
                  ))}
                </div>
              </div>
            </div> */}

            {/* Student Assignment */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-green-600" />
                <Label className="text-base font-semibold">Assign Students</Label>
                <span className="text-sm text-gray-500">({selectedStudents.length}/{capacity} selected)</span>
              </div>

              {/* Selected Students */}
              {selectedStudents.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm text-gray-600">Selected Students:</Label>
                  <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                    {getSelectedStudents().map(student => (
                      <Badge key={student.id} variant="outline" className="flex items-center gap-1">
                        {student.name}
                        <X 
                          className="h-3 w-3 cursor-pointer hover:text-red-500" 
                          onClick={() => removeStudent(student.id)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Student Search and Selection */}
              <div className="space-y-2">
                <Input 
                  placeholder="Search students..." 
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                />
                <div className="max-h-40 overflow-y-auto border rounded-md">
                  {filteredStudents.filter(student => !selectedStudents.includes(student.id)).map(student => (
                    <div 
                      key={student.id} 
                      className="flex items-center justify-between p-2 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                      onClick={() => addStudent(student.id)}
                    >
                      <div>
                        <div className="font-medium">{student.name}</div>
                        <div className="text-sm text-gray-500">{student.email}</div>
                      </div>
                      <Plus className="h-4 w-4 text-green-600" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="min-w-24">
              {classroom ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}