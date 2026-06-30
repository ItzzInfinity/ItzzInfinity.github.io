<!-- Functional Specification Document (FSD)  -->
# Thinking out Loud -  Will organize later
1. Need a way to generate resume as PDF on the go.
2. This should be cross-platform (Windows, Mac, Linux, Android, iOS).
3. So a web-based solution is preferred.
4. Need it to be a multi domain solution, 
5. Like I want to apply for VLSI and also have skill for embedded so I want to have a resume for both domains.
6. It should be easy to use and intuitive.
7. It should be highly modular.
8. Resume have set its own rules like 
   - Resume should be one page.
   - Resume should have a header with name and contact info.
   - Resume should have a summary section. - Dynamic based on the domain.
   - Resume should have a skills section. - Dynamic based on the domain.
   - Resume should have an experience section. - Dynamic based on the domain.
   - Resume should have an education section. - Dynamic based on the domain.
   - Resume should have a projects section. - Dynamic based on the domain.
   - Resume should have a footer section. 
   - Resume should have a section for certifications. - Dynamic based on the domain.
   - Resume should have a section for awards. - Dynamic based on the domain.
   - Resume should have a section for hobbies. 
   - Resume should have a section for languages known.
   - Resume should have a section for references.
9. All the pointers should be self adjustable as per the content. For example, if I have a lot of experience, the experience section should expand and other sections should adjust accordingly.
10. Best case would be to make this a personal github portfolio website with multiple sections as 
    - `Home`
    - `About`
    - `VSLI`    
      - `RTL Design`
      - `Verification`
      - `FPGA Design`
    - `Embedded`
    - `PCB Design`
    - More sections can be added as per the requirement. -  Upper layer access from `settings` 
    - `Setting`
    - `Download` -  This is the resume download section where user can download the resume in PDF format.
11. All the sections should have options to add, edit, delete, and rearrange the tabs.
12. The resume should be downloadable in PDF format with a single click.
13. The projects which I have done should have a `source` linked button to the right side of the project heading.
14. I will add detailed pointers to the every project like 5 - 6 pointers for each project. These should be displayed in a bullet format.
15. When there is empty space in the resume, it should be filled with the pointers according to the priority. If it is not fitting in one page the points can be removed from the bottom of the resume. The priority of the pointers should be in ascending order after being added which is editable in the webpage sections.
16. Downloadable resume should have a `Download` button. and a set of radio buttons to select the domain. And a section If I want to add a new line or custom text in the resume. 

   
# Structured Goal 

## Project Vision

Build a cross-platform web application that works as both a personal portfolio website and a dynamic resume generator. The application should let the user maintain reusable profile, skills, education, experience, certification, award, hobby, language, reference, and project data, then generate a one-page PDF resume customized for a selected domain such as VLSI, Embedded, PCB Design, RTL Design, Verification, or FPGA Design.

## Core Objectives

1. Create a web-based portfolio so it works on Windows, macOS, Linux, Android, and iOS.
2. Maintain all resume and portfolio content from an editable interface.
3. Support multiple domains, where each domain can choose different summary text, skills, experience, projects, certifications, and awards.
4. Generate a clean one-page resume PDF from selected domain data.
5. Automatically fit resume content into one page by using priority-based bullet selection.
6. Allow custom text or an extra line to be added before downloading the resume.
7. Keep the system modular so new sections, domains, and resume templates can be added later.

## Main Application Sections

1. `Home`
   - Landing section for personal branding, short intro, and quick navigation.
2. `About`
   - General profile, background, contact details, and career summary.
3. `VLSI`
   - Parent domain page for semiconductor-related work.
   - Subsections:
     - `RTL Design`
     - `Verification`
     - `FPGA Design`
4. `Embedded`
   - Embedded systems skills, projects, tools, and experience.
5. `PCB Design`
   - PCB design projects, tools, board details, and source links.
6. `Settings`
   - Add, edit, delete, reorder, and configure sections, domains, projects, and resume content.
7. `Download`
   - Select domain, add optional custom text, preview resume, and download PDF.

## Data Model Plan

1. `Profile`
   - Name, title, email, phone, LinkedIn, GitHub, portfolio URL, location.
2. `Domain`
   - Domain name, enabled status, order, related sections, and resume configuration.
3. `Summary`
   - Domain-specific summary text.
4. `Skill`
   - Skill name, category, domain mapping, priority, visibility.
5. `Experience`
   - Company, role, duration, location, domain mapping, bullet points.
6. `Education`
   - Degree, institute, duration, score, location.
7. `Project`
   - Project title, domain mapping, source link, tools used, bullet points.
8. `Certification`
   - Name, issuer, date, credential link, domain mapping.
9. `Award`
   - Title, organization, date, description, domain mapping.
10. `ResumeBullet`
   - Text, parent section, domain mapping, priority, enabled status.
11. `ResumeTemplate`
   - Layout rules, font sizes, spacing, visible sections, and fit strategy.

## Resume Generation Rules

1. Resume must fit on one page.
2. Header should always include name and contact information.
3. Summary, skills, experience, projects, certifications, and awards should change based on selected domain.
4. Education can remain mostly common, but should still be configurable.
5. Projects should show a `Source` button or link on the right side of the project heading.
6. Project details should appear as bullet points.
7. Each bullet point should have an editable priority.
8. When empty space is available, include more bullets based on priority.
9. When content exceeds one page, remove lower-priority bullets first.
10. If a complete section does not fit, hide optional sections before critical sections.
11. Suggested section priority:
    - Header
    - Summary
    - Skills
    - Experience
    - Projects
    - Education
    - Certifications
    - Awards
    - Languages
    - Hobbies
    - References

## Execution Plan

### Phase 1: Project Setup

1. Choose the frontend framework and project structure.
2. Set up routing for `Home`, `About`, domain pages, `Settings`, and `Download`.
3. Create a shared layout with navigation, responsive design, and basic theme styles.
4. Define reusable UI components for buttons, forms, tabs, modals, lists, and section editors.

### Phase 2: Content Schema and Storage

1. Define the application data schema for profile, domains, skills, projects, experience, education, and resume bullets.
2. Start with local JSON or browser storage for quick development.
3. Create seed data for VLSI, Embedded, PCB Design, RTL Design, Verification, and FPGA Design.
4. Keep the storage layer separate so it can later move to a database or backend API.

### Phase 3: Portfolio Pages

1. Build the `Home` page with personal intro and domain highlights.
2. Build the `About` page with profile, background, and contact information.
3. Build domain pages that display filtered skills, projects, tools, and experience.
4. Add project cards or project rows with title, description, bullet points, and source link.
5. Ensure pages work well on desktop and mobile.

### Phase 4: Settings Module

1. Build CRUD forms to add, edit, and delete:
   - Domains
   - Skills
   - Projects
   - Experience
   - Education
   - Certifications
   - Awards
   - Resume bullets
2. Add drag-and-drop or order controls to rearrange sections and items.
3. Add priority controls for every resume bullet.
4. Add domain mapping controls so each item can belong to one or more domains.
5. Add enable/disable toggles for optional content.

### Phase 5: Resume Preview

1. Build a resume preview component using the selected domain.
2. Filter all resume content by selected domain.
3. Render sections in the selected order.
4. Display source links beside project headings.
5. Add custom text input for optional one-line resume additions.
6. Create a print-friendly layout that matches A4 or Letter page dimensions.

### Phase 6: Auto-Fit Algorithm

1. Render the resume preview in a fixed one-page container.
2. Measure whether the content overflows the page.
3. If content overflows, remove the lowest-priority optional bullet.
4. Repeat until the resume fits on one page.
5. If space remains, add back higher-priority available bullets.
6. Keep required sections visible and only trim optional content.
7. Show a warning if required content still cannot fit after trimming.

### Phase 7: PDF Download

1. Add a `Download` page with domain radio buttons.
2. Add resume preview for the selected domain.
3. Add custom text input.
4. Add a single-click `Download PDF` button.
5. Generate PDF from the finalized one-page resume layout.
6. Test PDF output across desktop and mobile browsers.

### Phase 8: Testing and Validation

1. Test domain filtering for every section.
2. Test add, edit, delete, and reorder flows.
3. Test priority-based bullet trimming.
4. Test resume PDF output for one-page formatting.
5. Test mobile, tablet, and desktop layouts.
6. Test empty states when a section has no content.
7. Test source links and contact links.

### Phase 9: Future Enhancements

1. Add multiple resume templates.
2. Add cloud login and database sync.
3. Add import/export JSON backup.
4. Add analytics for downloaded resume versions.
5. Add AI-assisted summary and bullet rewriting.
6. Add theme customization for portfolio and resume.
7. Add public/private visibility controls for portfolio sections.

## Minimum Viable Product

The first working version should include:

1. Portfolio pages for `Home`, `About`, `VLSI`, `Embedded`, and `PCB Design`.
2. Editable local data for profile, skills, projects, education, and experience.
3. Domain selection on the `Download` page.
4. Resume preview filtered by selected domain.
5. Priority-based bullet trimming to keep the resume on one page.
6. One-click PDF download.

## Recommended Build Order

1. Build static portfolio layout.
2. Create data schema and seed content.
3. Connect pages to dynamic data.
4. Build resume preview.
5. Add domain filtering.
6. Add settings forms.
7. Add priority and ordering controls.
8. Add one-page fit logic.
9. Add PDF download.
10. Polish responsive design and test end-to-end.
11. Add public/private visibility controls for portfolio sections. - Download / Settings Must not be public. - Need to add an easter egg to get to the settings page.
