# Concave

A modern, full-stack cloud storage platform built with Next.js and Express, featuring file management, real-time collaboration, and secure sharing capabilities.

## 🛠️ Tech Stack

### Frontend

- **Framework**: Next.js 16 (React 19)
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI, shadcn/ui
- **State Management**: React Context API
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Notifications**: Sonner

### Backend

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **Authentication**: Supabase Auth
- **File Upload**: Multer
- **Password Hashing**: bcryptjs

## ✨ Features

### Core Functionality

- **File Management**: Upload, download, rename, and delete files
- **Folder Organization**: Create nested folder structures
- **Drag & Drop**: Intuitive file uploads
- **Search**: Global search across files and folders with keyboard shortcuts
- **Recent Files**: Quick access to recently accessed items
- **Starred Items**: Favorite files and folders for easy retrieval
- **Trash**: Soft delete with restore functionality

### Collaboration

- **File Sharing**: Share files and folders with other users
- **Public Links**: Generate password-protected public links
- **Permission Management**: Control access levels (viewer/editor)

### User Experience

- **Keyboard Navigation**: Full keyboard accessibility with shortcuts (`Ctrl+K` for search, `?` for help)
- **Dark Mode**: System-aware theme switching
- **Responsive Design**: Mobile-first, works on all devices
- **Real-time Updates**: Optimistic UI updates with context-based state management

## 📡 API Documentation

### Authentication

- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Files

- `GET /api/files` - List files (with folder filter)
- `POST /api/files` - Upload file
- `GET /api/files/:id` - Get file download URL
- `PATCH /api/files/:id` - Rename file
- `DELETE /api/files/:id` - Move file to trash
- `PATCH /api/files/trash/:id` - Restore file from trash
- `GET /api/files/trash` - List trashed files

### Folders

- `GET /api/folders` - List folders
- `POST /api/folders` - Create folder
- `GET /api/folders/:id` - Get folder details
- `PATCH /api/folders/:id` - Rename folder
- `DELETE /api/folders/:id` - Move folder to trash
- `PATCH /api/folders/:id/restore` - Restore folder from trash
- `GET /api/folders/trash` - List trashed folders

### Search & Discovery

- `GET /api/search?q=query` - Search files and folders
- `GET /api/recent` - Get recently accessed files
- `GET /api/stars` - List starred items
- `POST /api/stars` - Star a resource
- `DELETE /api/stars` - Unstar a resource

### Sharing

- `GET /api/shares` - List items shared with user
- `POST /api/shares` - Share file/folder with user
- `DELETE /api/shares/:id` - Remove share

### Public Links

- `POST /api/public-links` - Create public link
- `GET /api/public-links/:token` - Access public link
- `DELETE /api/public-links/:id` - Delete public link

## 📁 Project Structure

```
concave/
├── backend/
│   ├── controllers/       # Business logic
│   │   ├── auth.controller.js
│   │   ├── file.controller.js
│   │   ├── folder.controller.js
│   │   ├── public-link.controller.js
│   │   ├── recent.controller.js
│   │   ├── search.controller.js
│   │   ├── share.controller.js
│   │   └── star.controller.js
│   ├── routes/           # API routes
│   ├── middlewares/      # Auth middleware
│   ├── lib/             # Supabase client
│   ├── utils/           # Helper functions
│   └── server.js        # Express app entry
│
└── frontend/
    ├── src/
    │   ├── app/                    # Next.js app router
    │   │   ├── dashboard/          # Main dashboard pages
    │   │   │   ├── page.js         # Home/Files view
    │   │   │   ├── search/         # Search results
    │   │   │   ├── starred/        # Starred items
    │   │   │   ├── recent/         # Recent files
    │   │   │   ├── trash/          # Trash bin
    │   │   │   └── shared/         # Shared with me
    │   │   ├── public/             # Public link pages
    │   │   ├── login/              # Authentication
    │   │   └── layout.js           # Root layout
    │   ├── components/
    │   │   ├── files/              # File components
    │   │   ├── folders/            # Folder components
    │   │   ├── layout/             # Layout components
    │   │   ├── search/             # Search components
    │   │   ├── share/              # Sharing dialogs
    │   │   ├── ui/                 # shadcn/ui components
    │   │   └── upload/             # Upload components
    │   ├── context/                # React contexts
    │   │   ├── AuthContext.js
    │   │   ├── UploadContext.js
    │   │   └── StarredContext.js
    │   ├── api/                    # API client functions
    │   ├── lib/                    # Utilities
    │   └── utils/                  # Helper functions
    └── public/                     # Static assets
```

## 🔐 Environment Variables

### Backend (`backend/.env`)

```env
PORT=5000
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_KEY=your_supabase_service_role_key
```

### Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## 🚀 Setup & Local Installation

### Prerequisites

- Node.js 18+ and npm
- Supabase account and project

### 1. Clone the Repository

```bash
git clone https://github.com/mdfaizan0/concave.git
cd concave
```

### 2. Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Run the database migrations (SQL schema) from your Supabase dashboard
3. Enable Storage and create a bucket named `drive`
4. Copy your project URL and keys

### 3. Backend Setup

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
PORT=5000
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_KEY=your_supabase_service_role_key
```

Start the backend:

```bash
npm run dev
```

### 4. Frontend Setup

```bash
cd frontend
npm install
```

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
```

### 5. Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 📝 Notes & Limitations

### Current Limitations

- **File Size**: Upload size limited by Supabase Storage tier (default: 50MB)
- **Nested Public Links**: Public folder links only show immediate children (not recursive)
- **Real-time Sync**: No WebSocket implementation; updates require manual refresh
- **Permissions**: Binary permission model (viewer/editor); no granular controls

### Known Issues

- Some ESLint warnings related to React hooks dependencies (non-breaking)
- Search dropdown keyboard navigation may need refinement for very large result sets

---

**Built with ❤️ using Next.js and Express**

Thank You 💚