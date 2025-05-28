import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuTrigger, DropdownMenuSeparator} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, 
  TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus, MoreHorizontal, Edit, Trash2, 
  Users, UserCheck, Eye, Filter, Download, Calendar, ArrowLeft
} from "lucide-react";
import { AddClassroomDialog } from "@/components/Education/AddClassroomDialog";
import { toast } from "sonner";
import { PageLayout } from "../common/PageLayout";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export interface User {
  id: number;
  name: string;
  email: string;
  role: "teacher" | "student";
}

export interface Classroom {
  id: number;
  name: string;
  description: string;
  subject: string;
  grade: string;
  capacity: number;
  teacherIds: number[];
  studentIds: number[];
  status: "active" | "inactive" | "archived";
  createdAt: string;
  updatedAt: string;
}

// Mock data for classrooms
const mockClassrooms: Classroom[] = [
  {
    id: 1,
    name: "Advanced Mathematics",
    description: "Advanced calculus and algebra concepts",
    subject: "Mathematics",
    grade: "High School",
    capacity: 30,
    teacherIds: [1, 2],
    studentIds: [4, 5, 6, 7, 8],
    status: "active",
    createdAt: "2024-01-15",
    updatedAt: "2024-01-20"
  },
  {
    id: 2,
    name: "Biology Lab",
    description: "Hands-on biology experiments and research",
    subject: "Biology",
    grade: "Middle School",
    capacity: 25,
    teacherIds: [3],
    studentIds: [4, 5, 6],
    status: "active",
    createdAt: "2024-01-10",
    updatedAt: "2024-01-18"
  },
  {
    id: 3,
    name: "English Literature",
    description: "Classic and contemporary literature analysis",
    subject: "English",
    grade: "High School",
    capacity: 35,
    teacherIds: [1],
    studentIds: [4, 5, 6, 7],
    status: "inactive",
    createdAt: "2024-01-05",
    updatedAt: "2024-01-12"
  },
  {
    id: 4,
    name: "Computer Science Fundamentals",
    description: "Introduction to programming and algorithms",
    subject: "Computer Science",
    grade: "Middle School",
    capacity: 28,
    teacherIds: [2, 3],
    studentIds: [4, 5, 6, 7, 8],
    status: "active",
    createdAt: "2024-01-08",
    updatedAt: "2024-01-22"
  },
  {
    id: 5,
    name: "World History",
    description: "Global historical events and civilizations",
    subject: "History",
    grade: "High School",
    capacity: 32,
    teacherIds: [1],
    studentIds: [4, 5],
    status: "archived",
    createdAt: "2023-12-15",
    updatedAt: "2024-01-01"
  }
];

// Mock users data
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

export function ClassTable() {
  const navigate = useNavigate();
  const [classrooms, setClassrooms] = useState<Classroom[]>(mockClassrooms);
  const [searchTerm, setSearchTerm] = useState("");
  const [subjectFilter, setSubjectFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingClassroom, setEditingClassroom] = useState<Classroom | null>(null);

  // Filter classrooms based on search and filters
  const filteredClassrooms = classrooms.filter(classroom => {
    const matchesSearch = 
      classroom.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      classroom.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      classroom.subject.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSubject = subjectFilter === "all" || classroom.subject === subjectFilter;
    const matchesStatus = statusFilter === "all" || classroom.status === statusFilter;
    
    return matchesSearch && matchesSubject && matchesStatus;
  });

  // Get unique values for filters
  const uniqueSubjects = [...new Set(classrooms.map(c => c.subject))];

  // Helper functions
  const getTeacherNames = (teacherIds: number[]) => {
    return teacherIds.map(id => {
      const teacher = mockUsers.find(user => user.id === id && user.role === "teacher");
      return teacher?.name || "Unknown";
    });
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "default",
      inactive: "secondary",
      archived: "outline"
    } as const;
    
    const colors = {
      active: "bg-green-100 text-green-800",
      inactive: "bg-yellow-100 text-yellow-800",
      archived: "bg-gray-100 text-gray-800"
    };

    return (
      <Badge variant={variants[status as keyof typeof variants]} className={colors[status as keyof typeof colors]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const handleDelete = (id: number) => {
    setClassrooms(classrooms.filter(c => c.id !== id));
    toast.success("Class deleted successfully");
  };

  const handleStatusChange = (id: number, newStatus: string) => {
    setClassrooms(classrooms.map(c => 
      c.id === id ? { ...c, status: newStatus as "active" | "inactive" | "archived" } : c
    ));
    toast.success(`Class status updated to ${newStatus}`);
  };

  const handleView = (classroom: Classroom) => {
    toast.info(`Viewing ${classroom.name} details`);
    // Navigate to class details page
  };

  const handleEdit = (classroom: Classroom) => {
    setEditingClassroom(classroom);
    setIsAddDialogOpen(true);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSubjectFilter("all");
    setStatusFilter("all");
  };

  return (
    <PageLayout title="Class Management">
      <div className="relative mx-auto max-w-7xl">
        <Card className="shadow-lg border-2 border-gray-100">
          <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 border-b border-gray-200">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl font-bold text-gray-800">Class Management</CardTitle>
                <CardDescription className="text-gray-600 mt-1">
                  Manage and organize your educational classes efficiently
                </CardDescription>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/services')}
                  className="flex items-center gap-2 hover:bg-gray-50 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Services</span>
                </Button>
                <Button 
                  onClick={() => setIsAddDialogOpen(true)}
                  className="bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Class
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Filters and Search */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search classes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 border-2 border-gray-200 rounded-lg"
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                  <SelectTrigger className="w-40 border-2 border-gray-200">
                    <SelectValue placeholder="Subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subjects</SelectItem>
                    {uniqueSubjects.map(subject => (
                      <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40 border-2 border-gray-200">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>

                <Button 
                  variant="outline" 
                  onClick={clearFilters}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Classes</p>
                    <p className="text-2xl font-bold text-gray-800">{classrooms.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <UserCheck className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Active Classes</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {classrooms.filter(c => c.status === "active").length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <Users className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Students</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {classrooms.reduce((sum, c) => sum + c.studentIds.length, 0)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Results count */}
            <div className="text-sm text-gray-600">
              Showing {filteredClassrooms.length} of {classrooms.length} classes
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold text-gray-700">Class Name</TableHead>
                    <TableHead className="font-semibold text-gray-700">Subject</TableHead>
                    <TableHead className="font-semibold text-gray-700">Teachers</TableHead>
                    <TableHead className="font-semibold text-gray-700">Students</TableHead>
                    <TableHead className="font-semibold text-gray-700">Status</TableHead>
                    <TableHead className="font-semibold text-gray-700">Created</TableHead>
                    <TableHead className="text-right font-semibold text-gray-700">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClassrooms.map((classroom) => (
                    <TableRow key={classroom.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div>
                          <div className="font-medium text-gray-800">{classroom.name}</div>
                          <div className="text-sm text-gray-500 truncate max-w-48">
                            {classroom.description}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium text-gray-800">{classroom.subject}</div>
                          <div className="text-sm text-gray-500">{classroom.grade}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {getTeacherNames(classroom.teacherIds).map((name, index) => (
                            <Badge 
                              key={index} 
                              variant="outline" 
                              className="text-xs bg-gray-50 text-gray-700 border-gray-200"
                            >
                              {name}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-700">{classroom.studentIds.length}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(classroom.status)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-600">
                          {new Date(classroom.createdAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-gray-100">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem 
                              onClick={() => handleView(classroom)}
                              className="text-gray-700 hover:bg-gray-50"
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleStatusChange(classroom.id, "active")}
                              className="text-gray-700 hover:bg-gray-50"
                            >
                              Mark as Active
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleStatusChange(classroom.id, "inactive")}
                              className="text-gray-700 hover:bg-gray-50"
                            >
                              Mark as Inactive
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleStatusChange(classroom.id, "archived")}
                              className="text-gray-700 hover:bg-gray-50"
                            >
                              Archive
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDelete(classroom.id)}
                              className="text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredClassrooms.length === 0 && (
                <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-b-xl">
                  No classes found matching your criteria.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Add/Edit Dialog */}
        <AddClassroomDialog
          isOpen={isAddDialogOpen}
          onClose={() => {
            setIsAddDialogOpen(false);
            setEditingClassroom(null);
          }}
          title={editingClassroom ? "Edit Class" : "Add New Class"}
          classroom={editingClassroom || undefined}
          availableUsers={mockUsers}
        />
      </div>
    </PageLayout>
  );
}