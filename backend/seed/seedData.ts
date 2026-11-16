import { User } from '../models/User.ts';
import { Announcement } from '../models/Announcement.ts';
import { Complaint } from '../models/Complaint.ts';
import { Event } from '../models/Event.ts';
import { EventRegistration } from '../models/EventRegistration.ts';
import { LostFoundItem } from '../models/LostFoundItem.ts';

const daysFromNow = (days: number): Date => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
};

const daysAgo = (days: number): Date => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
};

export const seedDatabase = async (): Promise<void> => {
  const existingUsers = await User.countDocuments();
  if (existingUsers > 0) {
    return;
  }

  console.log('Seeding initial CampusConnect sample dataset into MongoDB...');

  const admin = await User.create({
    name: 'Dr. Kavitha Rao',
    email: 'admin@campusconnect.edu',
    password: 'Admin@123',
    role: 'ADMIN',
    department: 'Campus Administration',
    phone: '+91 98450 11220',
  });

  const student1 = await User.create({
    name: 'Aarav Sharma',
    email: 'student@campusconnect.edu',
    password: 'Student@123',
    role: 'STUDENT',
    usn: '1CC23CS001',
    department: 'Computer Science & Engineering',
    semester: 6,
    phone: '+91 98451 22334',
  });

  const student2 = await User.create({
    name: 'Priya Nair',
    email: 'priya.nair@campusconnect.edu',
    password: 'Student@123',
    role: 'STUDENT',
    usn: '1CC23CS042',
    department: 'Computer Science & Engineering',
    semester: 6,
    phone: '+91 98452 33445',
  });

  const student3 = await User.create({
    name: 'Rohan Kulkarni',
    email: 'rohan.k@campusconnect.edu',
    password: 'Student@123',
    role: 'STUDENT',
    usn: '1CC23EC019',
    department: 'Electronics & Communication',
    semester: 4,
    phone: '+91 98453 44556',
  });

  const student4 = await User.create({
    name: 'Sneha Deshmukh',
    email: 'sneha.d@campusconnect.edu',
    password: 'Student@123',
    role: 'STUDENT',
    usn: '1CC22IS028',
    department: 'Information Science & Engineering',
    semester: 8,
    phone: '+91 98454 55667',
  });

  await Announcement.insertMany([
    {
      title: 'Semester-End Practical Examination Schedule Published',
      description:
        'All B.E. students in 4th, 6th, and 8th semesters are informed that lab practical batches and external examiner schedules are now finalized. Students must carry their college ID card and certified lab records 15 minutes prior to the batch slot.',
      category: 'Examination',
      priority: 'Urgent',
      author: admin._id,
      createdAt: daysAgo(1),
    },
    {
      title: 'Annual Tech Symposium & 24-Hour Hackathon Registration Open',
      description:
        'The Department of Computer Science & Engineering invites student teams of 2–4 members to participate in CodeSprint 2026. Problem statements span Smart Mobility, Campus Automation, and FinTech.',
      category: 'Events',
      priority: 'Important',
      author: admin._id,
      createdAt: daysAgo(2),
    },
    {
      title: 'Campus Placement Drive: Cloud & Systems Engineering Roles',
      description:
        'Final-year and pre-final-year students with CGPA 7.0 and above can apply through the Placement Cell portal before Friday 5:00 PM. Resume verification will be conducted in Seminar Hall 2.',
      category: 'Placement',
      priority: 'Important',
      author: admin._id,
      createdAt: daysAgo(4),
    },
    {
      title: 'Central Library Extended Study Hours During Assessment Week',
      description:
        'The Central Reference Library and Digital Reading Room will remain open from 8:00 AM to 10:30 PM on weekdays and 9:00 AM to 6:00 PM on Saturdays through the end of the month.',
      category: 'Academic',
      priority: 'Normal',
      author: admin._id,
      createdAt: daysAgo(6),
    },
    {
      title: 'Scheduled Campus Network Maintenance on Sunday Morning',
      description:
        'High-speed Wi-Fi access points in Academic Block B and Hostel Wing 1 will undergo firmware upgrades between 6:30 AM and 8:30 AM this Sunday. Brief connectivity drops may occur.',
      category: 'General',
      priority: 'Normal',
      author: admin._id,
      createdAt: daysAgo(8),
    },
  ]);

  await Complaint.insertMany([
    {
      title: 'Classroom Projector Flickering & Loose Switchboard',
      description:
        'The ceiling-mounted HDMI projector in Lecture Hall 304 loses signal intermittently during lectures, and the wall switchboard beside the podium sparks lightly when toggled.',
      category: 'Electrical',
      location: 'Academic Block A — Room 304',
      imageUrl: '/src/assets/images/complaint_sample_lab_1794837980019.jpg',
      status: 'In Progress',
      adminRemarks: 'Electrical maintenance team inspected the breaker; replacement relay ordered.',
      student: student1._id,
      statusHistory: [
        {
          status: 'Pending',
          remark: 'Complaint submitted by student.',
          updatedBy: student1._id,
          updatedAt: daysAgo(3),
        },
        {
          status: 'In Progress',
          remark: 'Electrical maintenance team inspected the breaker; replacement relay ordered.',
          updatedBy: admin._id,
          updatedAt: daysAgo(1),
        },
      ],
      createdAt: daysAgo(3),
    },
    {
      title: 'Low Water Pressure on Second Floor Drinking Fountain',
      description:
        'The RO drinking water dispenser near the CSE department corridor has very low flow and the cooling indicator light is off since yesterday afternoon.',
      category: 'Water',
      location: 'CSE Block — 2nd Floor Corridor',
      status: 'Pending',
      student: student1._id,
      statusHistory: [
        {
          status: 'Pending',
          remark: 'Complaint submitted by student.',
          updatedBy: student1._id,
          updatedAt: daysAgo(1),
        },
      ],
      createdAt: daysAgo(1),
    },
    {
      title: 'Weak Wi-Fi Coverage in Embedded Systems Lab',
      description:
        'Students working on IoT boards in Lab 202 experience frequent disconnects and packet loss when more than 20 laptops connect simultaneously.',
      category: 'Internet',
      location: 'ECE Block — Lab 202',
      status: 'Resolved',
      adminRemarks: 'Replaced dual-band ceiling access point and rebalanced channel allocation.',
      student: student3._id,
      statusHistory: [
        {
          status: 'Pending',
          remark: 'Complaint submitted by student.',
          updatedBy: student3._id,
          updatedAt: daysAgo(7),
        },
        {
          status: 'In Progress',
          remark: 'IT Network Admin conducting signal sweep in ECE Lab 202.',
          updatedBy: admin._id,
          updatedAt: daysAgo(5),
        },
        {
          status: 'Resolved',
          remark: 'Replaced dual-band ceiling access point and rebalanced channel allocation.',
          updatedBy: admin._id,
          updatedAt: daysAgo(4),
        },
      ],
      createdAt: daysAgo(7),
    },
    {
      title: 'Broken Bench Desks in Seminar Room 105',
      description:
        'Three wooden writing desk hinges on the left aisle of Room 105 have come loose and need carpentry repair before internal assessments.',
      category: 'Classroom',
      location: 'Main Block — Room 105',
      status: 'Resolved',
      adminRemarks: 'Carpentry team tightened and reinforced all 3 desk hinges.',
      student: student2._id,
      statusHistory: [
        {
          status: 'Pending',
          remark: 'Complaint submitted by student.',
          updatedBy: student2._id,
          updatedAt: daysAgo(9),
        },
        {
          status: 'Resolved',
          remark: 'Carpentry team tightened and reinforced all 3 desk hinges.',
          updatedBy: admin._id,
          updatedAt: daysAgo(6),
        },
      ],
      createdAt: daysAgo(9),
    },
    {
      title: 'Washroom Exhaust & Cleaning Schedule Delay',
      description:
        'The ground floor washroom near the library annex requires deep cleaning and the exhaust fan is not running.',
      category: 'Cleaning',
      location: 'Library Annex — Ground Floor',
      status: 'In Progress',
      adminRemarks: 'Housekeeping supervisor notified; fan motor replacement scheduled today.',
      student: student4._id,
      statusHistory: [
        {
          status: 'Pending',
          remark: 'Complaint submitted by student.',
          updatedBy: student4._id,
          updatedAt: daysAgo(2),
        },
        {
          status: 'In Progress',
          remark: 'Housekeeping supervisor notified; fan motor replacement scheduled today.',
          updatedBy: admin._id,
          updatedAt: daysAgo(1),
        },
      ],
      createdAt: daysAgo(2),
    },
    {
      title: 'Main Gate Bicycle Stand Lighting Outage',
      description:
        'Two LED floodlights over the student bicycle parking bay near Gate 2 turn off intermittently after 6:30 PM.',
      category: 'Electrical',
      location: 'Campus Gate 2 — Parking Bay',
      status: 'Pending',
      student: student2._id,
      statusHistory: [
        {
          status: 'Pending',
          remark: 'Complaint submitted by student.',
          updatedBy: student2._id,
          updatedAt: daysAgo(1),
        },
      ],
      createdAt: daysAgo(1),
    },
  ]);

  const event1 = await Event.create({
    title: 'CodeSprint 2026: 24-Hour Campus Hackathon',
    description:
      'Build real-world full-stack applications and AI prototypes with mentorship from alumni engineers. Includes workspace access, meals, and internship fast-track interviews.',
    date: daysFromNow(5),
    time: '09:00 AM',
    venue: 'Innovation Center & Lab Complex',
    category: 'Technical',
    capacity: 120,
    organizer: 'CSE Association & ACM Student Chapter',
    imageUrl: '/src/assets/images/event_tech_hackathon_1794837980004.jpg',
    createdBy: admin._id,
  });

  const event2 = await Event.create({
    title: 'Annual Engineering Innovation Symposium',
    description:
      'Keynote sessions by industry architects on distributed systems, sustainable infrastructure, and research paper presentations by final-year engineering students.',
    date: daysFromNow(11),
    time: '10:30 AM',
    venue: 'Dr. APJ Abdul Kalam Main Auditorium',
    category: 'Seminar',
    capacity: 250,
    organizer: 'Academic Research Council',
    imageUrl: '/src/assets/images/event_cultural_auditorium_1794837979208.jpg',
    createdBy: admin._id,
  });

  const event3 = await Event.create({
    title: 'Full-Stack MERN Architecture Hands-on Workshop',
    description:
      'Practical weekend bootcamp covering MongoDB schema modeling, JWT security, REST API design, and deploying scalable React applications.',
    date: daysFromNow(16),
    time: '02:00 PM',
    venue: 'CSE Seminar Hall 2',
    category: 'Workshop',
    capacity: 60,
    organizer: 'Developer Student Club',
    imageUrl: '/src/assets/images/event_tech_hackathon_1794837980004.jpg',
    createdBy: admin._id,
  });

  const event4 = await Event.create({
    title: 'Inter-Department Cultural & Acoustic Evening',
    description:
      'An evening of classical music, contemporary bands, theatre skits, and photography showcases celebrating student talent across all engineering departments.',
    date: daysFromNow(22),
    time: '05:00 PM',
    venue: 'Open Air Amphitheatre',
    category: 'Cultural',
    capacity: 300,
    organizer: 'Campus Cultural Committee',
    imageUrl: '/src/assets/images/event_cultural_auditorium_1794837979208.jpg',
    createdBy: admin._id,
  });

  await EventRegistration.insertMany([
    { event: event1._id, student: student1._id, registeredAt: daysAgo(2) },
    { event: event1._id, student: student2._id, registeredAt: daysAgo(2) },
    { event: event1._id, student: student3._id, registeredAt: daysAgo(1) },
    { event: event2._id, student: student2._id, registeredAt: daysAgo(3) },
    { event: event2._id, student: student4._id, registeredAt: daysAgo(1) },
    { event: event3._id, student: student1._id, registeredAt: daysAgo(1) },
  ]);

  await LostFoundItem.insertMany([
    {
      itemName: 'Matte Black Dell USB-C Charger (65W)',
      type: 'Found',
      description:
        'Found near the corner table of the Central Library Digital Reading Room with a blue Velcro cable tie.',
      location: 'Central Library — 2nd Floor',
      date: daysAgo(1),
      contactInfo: 'priya.nair@campusconnect.edu · Ext. 204',
      status: 'Open',
      reportedBy: student2._id,
    },
    {
      itemName: 'Silver Casio fx-991EX Scientific Calculator',
      type: 'Lost',
      description:
        'Left behind after the Applied Mathematics lecture on Monday morning. Has initials "A.S." written on the back cover.',
      location: 'Academic Block A — Room 201',
      date: daysAgo(2),
      contactInfo: 'student@campusconnect.edu · +91 98451 22334',
      status: 'Open',
      reportedBy: student1._id,
    },
    {
      itemName: 'Blue Insulated Steel Water Bottle',
      type: 'Found',
      description:
        'Submitted to the Student Affairs desk after Tuesday afternoon lab session in Network Lab 1.',
      location: 'CSE Block — Network Lab 1',
      date: daysAgo(4),
      contactInfo: 'Student Affairs Office · Ground Floor',
      status: 'Claimed',
      reportedBy: student3._id,
    },
    {
      itemName: 'College ID Card Holder & Lanyard (ISE Dept)',
      type: 'Lost',
      description:
        'Navy blue lanyard with smart access card dropped near the Campus Canteen walkway during lunch break.',
      location: 'Main Canteen Walkway',
      date: daysAgo(3),
      contactInfo: 'sneha.d@campusconnect.edu · +91 98454 55667',
      status: 'Open',
      reportedBy: student4._id,
    },
  ]);

  console.log('Sample dataset seeded successfully.');
};
