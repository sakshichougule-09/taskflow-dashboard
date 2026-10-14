# TaskFlow Dashboard

A responsive task management dashboard built using React and Vite. The application provides a user-friendly interface for managing tasks, viewing dashboard information, organizing work, and navigating workspace features across desktop, tablet, and mobile devices.

## Project Overview

TaskFlow Dashboard is a frontend web application designed to simplify task organization and workspace management. It includes a dashboard layout with sidebar navigation and dedicated sections for different activities.

## Features

- **Dashboard:** Overview of tasks and workspace activities.
- **Task Management:** View and organize tasks.
- **Task Search:** Search for tasks using the available search interface.
- **Calendar:** Access the calendar section.
- **Team Members:** View the team members section.
- **Notes:** Access notes and related information.
- **Reports:** View the reports section.
- **Inbox:** Access inbox and notification features.
- **Sidebar Navigation:** Navigate between application sections.
- **Responsive Design:** Layout adapts to desktop, tablet, and mobile screens.
- **Local Storage:** Supported application data can be saved in the browser where implemented.

## Technologies Used

- React
- Vite
- JavaScript
- HTML5
- CSS3
- Lucide React
- Git
- GitHub

## Project Workflow

1. **Application Startup:** Vite starts the development server and loads the React application.
2. **Application Rendering:** React renders the main application interface.
3. **Navigation:** The sidebar allows users to navigate between dashboard sections.
4. **Feature Interaction:** Users interact with the available task, calendar, team, notes, reports, and inbox interfaces.
5. **Responsive Layout:** CSS media queries and responsive styles adjust the layout for different screen sizes.
6. **Data Handling:** Features that use browser local storage can retain supported data in that browser.
7. **Production Build:** Vite builds the application into optimized files for deployment.

## Project Structure

````text
taskflow-dashboard/
├── public/
├── src/
│   ├── components/
│   │   └── Sidebar.jsx
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── Tasks.jsx
│   │   ├── Calendar.jsx
│   │   ├── TeamMembers.jsx
│   │   ├── Notes.jsx
│   │   ├── Reports.jsx
│   │   └── Inbox.jsx
│   ├── App.jsx
│   ├── App.css
│   └── main.jsx
├── index.html
├── package.json
├── package-lock.json
├── vite.config.js
├── .gitignore
└── README.md


## Requirements

Install the following before running the project:

- Node.js
- npm
- Visual Studio Code (recommended)
- Git

## Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/sakshichougule-09/taskflow-dashboard.git
````

### 2. Open the Project Folder

```bash
cd taskflow-dashboard
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Start the Development Server

```bash
npm run dev
```

Open the local URL shown in the terminal to view the application.

## Mobile Testing

To test the application on a mobile device connected to the same Wi-Fi network as your computer, run:

```bash
npm run dev -- --host 0.0.0.0
```

Open the network URL displayed by Vite on your mobile device. Keep the development server running during testing.

## Production Build

To create a production build, run:

```bash
npm run build
```

To preview the production build locally, run:

```bash
npm run preview
```

## GitHub Workflow

Use the following commands to save and upload project changes:

```bash
git add .
git commit -m "Update TaskFlow Dashboard"
git push origin main
```

The repository is available at:

[TaskFlow Dashboard on GitHub](https://github.com/sakshichougule-09/taskflow-dashboard)

## Deployment

The project can be deployed using Vercel:

1. Sign in to Vercel using GitHub.
2. Import the `taskflow-dashboard` repository.
3. Select Vite as the framework if it is not detected automatically.
4. Use `npm run build` as the build command.
5. Use `dist` as the output directory.
6. Deploy the project and open the generated URL.

## Important Notes

- Browser local storage is specific to the browser and device unless additional synchronization is implemented.
- A frontend interface alone does not provide a shared database or server-side authentication.
- Actual functionality depends on the features implemented in the project source code.

## Future Enhancements

- Backend and database integration
- User authentication and authorization
- Shared tasks and team collaboration
- Improved reporting and analytics
- Cloud-based data synchronization

## Author

Developed as a React and Vite task management dashboard project.
