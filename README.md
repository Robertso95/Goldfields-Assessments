# Goldfields Assessment System

---

**Authors:**  
Samuel Robertson, Samuel William, Sujin Bae, Sukhde Sukh

---

## Project Overview

The Goldfields Assessment System is a web application designed to support teachers at Goldfields School. Built upon the foundation of a previous group’s work, it enables staff to upload and manage a variety of assessment evidence—including reports, images, and videos—while organizing learning sets tailored to individual students.

---

## Features

- **Dashboard:**  
  Quick access to create new assessments, edit tags, and manage learning sets.

- **Create New Assessments:**  
  Teachers can record detailed student assessments by selecting class/student names, subjects, specific criteria, tags, comments, and completion dates, including sensory-based learning descriptions.

- **Add Tags:**  
  Attach or create assessment descriptors (e.g., material interaction, routine awareness, problem-solving) to accurately reflect learning progress.

- **Filter:**  
  Filter classes and students, especially helpful for teachers assigned to multiple classes.

- **Overview Box:**  
  Gives a summary of classes, breakdown of students, and current learning sets—providing a snapshot of classroom progress and focus areas.

- **Class Table System:**  
  View and search for students within a class, click to access profiles, edit details, transfer students, and manage assessments.

- **Student Assessment System (View):**  
  See a student’s record of assessments, with options to edit/delete each, add evidence, print records, and filter by subject.

- **Assign Teachers System:**  
  (Admin/Principal feature) Assign/manage teachers for classes—designate main/additional teachers and update assignments through an intuitive interface.

---

## Technical Stack

- **Frontend:** React.js, AntDesign.js  
- **Backend:** Node.js, Express.js  
- **Database:** MongoDB  
- **Cloud Storage:** Cloudinary  
- **Development Tools:** Visual Studio Code, GitHub

---

## Project Setup

### Environment File

A `.env` file is required in the backend folder to connect to the database. This file is not included in the GitHub repository. If you are taking over this project, the `.env` file should be provided in the handover documentation. The file specifies the server port and the `MONGO_URI` database connection string.

### Local Setup Steps

1. **Clone the Repository:**  
   `git clone https://github.com/Robertso95/Goldfields-Assessments`

2. **Install Backend Dependencies:**  
   ```
   cd Goldfields-Assessments/backend
   npm install
   ```

3. **Install Frontend Dependencies:**  
   ```
   cd ../frontend
   npm install
   ```

4. **Run the Application:**  
   - Start the backend:
     ```
     cd ../backend
     npm run dev
     ```
   - Start the frontend:
     ```
     cd ../frontend
     npm start
     ```

---

## User Guide

### Log In Page

1. Enter email address.
2. Enter password.
3. Click **Sign In** (successful login redirects to home page).
4. Use the top-right link to go to the **SIGNUP** page.

### Signup Page

1. Click the **Signup** button (top right).
2. Enter Full Name (capitalize first letter of first and last name).
3. Enter email address.
4. Enter desired password.
5. Click the green **Sign Up** button.
6. Use the top-right link to return to the **LOGIN** page.

### Manage Accounts Page

- View all accounts, change roles, assign parents to children, delete/search accounts.
- **Search:** Use "Search by Full Name" input box.
- **Change Roles:**  
  - Admin: Full access, can assign teachers.  
  - Teacher: Can create stories and view classes.  
  - Parent: View child's stories, invite family.  
  - Family: View stories (when invited).
- **Assign Parent to Child:**  
  - Set user as Parent, select child from dropdown.
- **Delete Account:**  
  - Click delete icon, confirm in popup.
- **Assign Teachers to Classes:**  
  - Admin-only.  
  - Assign Main/Additional Teachers from dropdowns.

### Assessments Page

- **Filter:** Select class to display students.
- **Overview Box:** Summary of classes, students, learning sets.
- **Table System:**  
  - List/search students.  
  - Click name to open profile (edit, transfer, assessment management).

### Create New Assessments Page

1. Go to Dashboard → Create New Assessments.
2. Select Class Name (dropdown).
3. Select Student Name (dropdown).
4. Select Subject (dropdown).
5. Select Assessment (dropdown).
6. Add Tags (select or create).
7. Additional Comments (text box).
8. Set Completed Date (date picker).
9. Click **Save** or **Submit**.

### Edit Tags Page

1. Navigate to Edit Tag Page.
2. Select Subject (dropdown).
3. Select Assignment (dropdown).
4. View existing tags.
5. Add New Tag (input field, click **Add**).
6. Edit/Remove tags (rename or delete if option available).
7. Click **Save** or **Update**.

### Student Assessment (View) Page

1. **View Assessments:**  
   - Open student profile to see all assessments.
   - Entries show class, subject, assessment type, tags, comments, date.
2. **Filter by Subject:**  
   - Use Subject dropdown.
3. **Edit Assessment:**  
   - Click Edit.  
   - Update fields, add evidence, change date.
4. **Delete Assessment:**  
   - Click Delete, confirm in popup.
5. **Add New Evidence:**  
   - Upload files (photos, videos, documents).
6. **Print Assessments:**  
   - Print individual or all assessments for the student.


## Contact

For further information or support, contact the project authors or open an issue on the [GitHub repository](https://github.com/Robertso95/Goldfields-Assessments).
