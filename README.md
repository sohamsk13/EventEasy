## 🚀 Overview
**EventEase** is a **scalable and intuitive event management platform** that allows authenticated users to create, manage, and track events while enabling the public to view event details and RSVP seamlessly.  
It is built with a **modern full-stack tech stack**, focusing on **secure authentication, efficient API design, robust database integration, and professional-grade UI/UX**.

---

## 🛠️ Tech Stack

| Layer | Technology |
|--------|-----------|
| **Language** | TypeScript |
| **Framework** | [Next.js 15](https://nextjs.org/) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) |
| **Database** | PostgreSQL (Supabase) |
| **ORM** | [Prisma](https://www.prisma.io/) |
| **Authentication** | [Better Auth](https://better-auth.com/) (Recommended) |
| **Deployment** | [Vercel](https://vercel.com/) |


## 🔑 Features

### **Authentication & Authorization**
- 🔐 Secure email-based login and registration
- 🔑 Role-based access control (Admin, Staff, Event Owner)
- 🔄 Persistent sessions with token-based security

### **Event Management (Private)**
- ➕ Create, edit, and delete events  
- 📝 Customizable fields (location, time, description, etc.)  
- 📤 Generate **public share links** for events  
- 📊 Attendee management with CSV export  

### **Public Engagement**
- 🌐 Public event page at `/event/[id]`  
- 📩 RSVP forms for attendees (name, email, timestamp)  

### **Database & API** 
- 🔒 Secure Next.js route handlers for CRUD APIs  
- 💾 Persistent data storage on Supabase

---
