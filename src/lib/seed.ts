import { AppData } from "@/types";

// Real profile data for Anjan Prasad, wired from
// ~/Downloads/all_resumes/master_profile.json plus the full project,
// experience, and summary detail from template.pdf. Seed ids are stable
// strings so the data is deterministic across reloads.
export const seedData: AppData = {
  profile: {
    name: "Anjan Prasad",
    title: "FPGA Design & Verification Engineer",
    email: "prasad.anjan25@gmail.com",
    phone: "+91 6290764153",
    linkedin: "linkedin.com/in/anjan-prasad-itzzinfinity",
    github: "github.com/ItzzInfinity",
    portfolio: "itzzinfinity.github.io",
    location: "Kolkata, West Bengal, India",
    about:
      "FPGA Design Engineer with hands-on experience in RTL design, FPGA prototyping, and digital system implementation. Skilled in Verilog, SystemVerilog, and hardware verification methodologies, with strong knowledge of protocols like UART, I2C, and SPI. Experienced in using industry-standard tools such as Vivado, Quartus, and Gowin EDA for design, synthesis, and simulation.",
  },
  // Per-domain summaries adapted from the old resume variants in
  // ~/Downloads/all_resumes (DV / FPGA / Embedded / PCB_Design PDFs).
  domains: [
    {
      id: "vlsi", name: "VLSI", slug: "vlsi", enabled: true, order: 0, resumeTitle: "VLSI Design Engineer",
      summary:
        "VLSI Design and Verification Engineer with hands-on experience in UVM-based verification environments, RTL design, and FPGA prototyping. Skilled in SystemVerilog, SVA, and debugging using industry-standard EDA tools. Seeking opportunities to contribute to scalable verification environments and strengthen expertise in SoC-level validation and modern verification methodologies.",
    },
    {
      id: "rtl", name: "RTL Design", slug: "rtl", enabled: true, order: 1, parentId: "vlsi", resumeTitle: "RTL Design Engineer",
      summary:
        "RTL Design Engineer with hands-on experience designing synthesizable Verilog blocks — counters, FSMs, arbiters, and protocol interfaces — validated with self-checking testbenches. Strong foundation in digital design concepts and industry-standard design workflows using Synopsys VCS, Spyglass, and Design Compiler.",
    },
    {
      id: "verification", name: "Verification", slug: "verification", enabled: true, order: 2, parentId: "vlsi", resumeTitle: "Design Verification Engineer",
      summary:
        "Design Verification Engineer with hands-on experience building UVM-based verification environments in SystemVerilog with SVA, constrained-random stimulus, and functional coverage. Skilled in debugging using Synopsys VCS and QuestaSim. Seeking opportunities to contribute to scalable verification environments and SoC-level validation.",
    },
    {
      id: "fpga", name: "FPGA Design", slug: "fpga", enabled: true, order: 3, parentId: "vlsi", resumeTitle: "FPGA Design Engineer",
      summary:
        "FPGA Design Engineer with hands-on experience in RTL design, FPGA prototyping, and digital system implementation. Skilled in Verilog, SystemVerilog, and hardware verification methodologies, with strong knowledge of protocols like UART, I2C, and SPI. Experienced in using industry-standard tools such as Vivado, Quartus, and Gowin EDA for design, synthesis, and simulation.",
    },
    {
      id: "embedded", name: "Embedded", slug: "embedded", enabled: true, order: 4, resumeTitle: "Embedded Systems Engineer",
      summary:
        "Embedded systems and IoT enthusiast with hands-on experience in microcontrollers, real-time data processing, hardware-software integration, and automation. Skilled in Python, C, and Verilog with a focus on low-level control, GUI development, and connected system design.",
    },
    {
      id: "pcb", name: "PCB Design", slug: "pcb", enabled: true, order: 5, resumeTitle: "PCB Design Engineer",
      summary:
        "Electronics Engineer with hands-on experience in hardware prototyping, PCB design, and embedded system development. Skilled in schematic design, 2-layer PCB layout, hardware debugging, and real-time system integration using KiCad, Altium, and EasyEDA, with a strong foundation in circuit design, sensors, and communication protocols.",
    },
  ],
  skills: [
    // HDL / HVL
    { id: "sk-verilog", name: "Verilog", category: "HDL", domainIds: ["vlsi", "rtl", "verification", "fpga", "embedded"], priority: 1, visible: true },
    { id: "sk-sv", name: "SystemVerilog", category: "HVL", domainIds: ["vlsi", "rtl", "verification", "fpga"], priority: 1, visible: true },
    // Verification
    { id: "sk-uvm", name: "UVM", category: "Verification", domainIds: ["vlsi", "verification"], priority: 1, visible: true },
    { id: "sk-sva", name: "SVA", category: "Verification", domainIds: ["vlsi", "verification"], priority: 2, visible: true },
    { id: "sk-crv", name: "Constrained Random Verification", category: "Verification", domainIds: ["vlsi", "verification"], priority: 2, visible: true },
    { id: "sk-fcov", name: "Functional Coverage", category: "Verification", domainIds: ["vlsi", "verification"], priority: 3, visible: true },
    { id: "sk-ccov", name: "Code Coverage", category: "Verification", domainIds: ["vlsi", "verification"], priority: 3, visible: true },
    // Protocols
    { id: "sk-uart", name: "UART", category: "Protocols", domainIds: ["vlsi", "rtl", "verification", "fpga", "embedded"], priority: 1, visible: true },
    { id: "sk-spi", name: "SPI", category: "Protocols", domainIds: ["vlsi", "rtl", "fpga", "embedded"], priority: 1, visible: true },
    { id: "sk-i2c", name: "I2C", category: "Protocols", domainIds: ["vlsi", "rtl", "fpga", "embedded"], priority: 1, visible: true },
    { id: "sk-apb", name: "APB", category: "Protocols", domainIds: ["vlsi", "verification", "rtl"], priority: 2, visible: true },
    // FPGAs worked on
    { id: "sk-cyclone", name: "Altera Cyclone II", category: "FPGAs Worked On", domainIds: ["fpga", "vlsi"], priority: 1, visible: true },
    { id: "sk-tang1k", name: "Tang Nano 1K", category: "FPGAs Worked On", domainIds: ["fpga", "vlsi"], priority: 2, visible: true },
    { id: "sk-tang9k", name: "Tang Nano 9K", category: "FPGAs Worked On", domainIds: ["fpga", "vlsi"], priority: 2, visible: true },
    // EDA tools
    { id: "sk-vcs", name: "Synopsys VCS", category: "EDA Tools", domainIds: ["vlsi", "verification"], priority: 1, visible: true },
    { id: "sk-questa", name: "QuestaSim", category: "EDA Tools", domainIds: ["vlsi", "verification"], priority: 1, visible: true },
    { id: "sk-modelsim", name: "ModelSim", category: "EDA Tools", domainIds: ["vlsi", "verification", "fpga"], priority: 2, visible: true },
    { id: "sk-vivado", name: "Vivado", category: "EDA Tools", domainIds: ["fpga", "vlsi"], priority: 1, visible: true },
    { id: "sk-quartus", name: "Quartus Prime", category: "EDA Tools", domainIds: ["fpga", "vlsi"], priority: 2, visible: true },
    { id: "sk-spyglass", name: "Spyglass", category: "EDA Tools", domainIds: ["vlsi", "rtl"], priority: 2, visible: true },
    { id: "sk-dc", name: "Design Compiler", category: "EDA Tools", domainIds: ["vlsi", "rtl"], priority: 3, visible: true },
    { id: "sk-gowin", name: "Gowin EDA", category: "EDA Tools", domainIds: ["fpga"], priority: 2, visible: true },
    // PCB design (from the PCB_Design resume variant)
    { id: "sk-kicad", name: "KiCad", category: "PCB Design", domainIds: ["pcb"], priority: 1, visible: true },
    { id: "sk-altium", name: "Altium (Beginner)", category: "PCB Design", domainIds: ["pcb"], priority: 2, visible: true },
    { id: "sk-easyeda", name: "EasyEDA", category: "PCB Design", domainIds: ["pcb"], priority: 1, visible: true },
    // Programming
    { id: "sk-c", name: "C", category: "Programming", domainIds: ["embedded", "fpga"], priority: 1, visible: true },
    { id: "sk-python", name: "Python", category: "Programming", domainIds: ["embedded", "fpga", "vlsi", "verification"], priority: 1, visible: true },
    { id: "sk-pyscript", name: "Python Scripting", category: "Scripting", domainIds: ["vlsi", "verification"], priority: 2, visible: true },
    // OS
    { id: "sk-linux", name: "Linux (Ubuntu, Debian)", category: "Operating System", domainIds: ["vlsi", "rtl", "verification", "fpga", "embedded", "pcb"], priority: 2, visible: true },
    { id: "sk-windows", name: "Windows", category: "Operating System", domainIds: ["vlsi", "rtl", "verification", "fpga", "embedded", "pcb"], priority: 3, visible: true },
  ],
  experience: [
    {
      id: "exp-sisir",
      company: "Sisir Radar Pvt. Ltd.",
      role: "RF Integration Engineer",
      startDate: "Dec 2025",
      endDate: "Present",
      location: "Kolkata, India",
      domainIds: ["vlsi", "rtl", "verification", "fpga", "embedded", "pcb"],
      bullets: [
        { id: "exb-sisir-1", text: "Testing and integration of RF subsystems.", priority: 1, domainIds: ["vlsi", "rtl", "verification", "fpga", "embedded", "pcb"] },
        { id: "exb-sisir-2", text: "Built 4 Channel Temperature Datalogger.", priority: 2, domainIds: ["vlsi", "rtl", "verification", "fpga", "embedded", "pcb"] },
        { id: "exb-sisir-3", text: "Field testing of drone and space-borne Synthetic Aperture Radar (SAR) and Ground Penetrating Radar (GPR).", priority: 3, domainIds: ["vlsi", "rtl", "verification", "fpga", "embedded", "pcb"] },
      ],
    },
    {
      id: "exp-sodexo",
      company: "Sodexo India Services Pvt. Ltd.",
      role: "Biomedical Engineer",
      startDate: "Apr 2023",
      endDate: "Nov 2025",
      location: "Kolkata, India",
      domainIds: ["vlsi", "rtl", "verification", "fpga", "embedded", "pcb"],
      bullets: [
        { id: "exb-sodexo-1", text: "Maintained and calibrated biomedical equipment in compliance with quality and safety standards.", priority: 1, domainIds: ["vlsi", "rtl", "verification", "fpga", "embedded", "pcb"] },
        { id: "exb-sodexo-2", text: "Generated detailed technical and calibration reports for audits and internal documentation.", priority: 2, domainIds: ["vlsi", "rtl", "verification", "fpga", "embedded", "pcb"] },
        { id: "exb-sodexo-3", text: "Planned and coordinated team activities to ensure timely, end-to-end service delivery.", priority: 3, domainIds: ["vlsi", "rtl", "verification", "fpga", "embedded", "pcb"] },
        // Lower-priority fillers from the Embedded / PCB_Design resume variants.
        { id: "exb-sodexo-4", text: "Debugged real-time hardware faults in critical biomedical instruments.", priority: 4, domainIds: ["vlsi", "rtl", "verification", "fpga", "embedded", "pcb"] },
        { id: "exb-sodexo-5", text: "Conducted fault diagnosis, preventive maintenance, and documentation for compliance.", priority: 5, domainIds: ["embedded", "pcb"] },
      ],
    },
    {
      id: "exp-electrometer",
      company: "Electro Meter Corporation",
      role: "Test Engineer (Thermal & Electro Technical Lab)",
      startDate: "Feb 2022",
      endDate: "Nov 2022",
      location: "Kolkata, India",
      domainIds: ["vlsi", "rtl", "verification", "fpga", "embedded", "pcb"],
      bullets: [
        { id: "exb-em-1", text: "Performed laboratory and on-site calibration of a wide range of thermal and electrical instruments.", priority: 1, domainIds: ["vlsi", "rtl", "verification", "fpga", "embedded", "pcb"] },
        { id: "exb-em-2", text: "Built calibration setups: Scale Tape Calibrator, Dialysis Machine Calibrator, Anemometer, and Lux Meter setups.", priority: 2, domainIds: ["vlsi", "rtl", "verification", "fpga", "embedded", "pcb"] },
        { id: "exb-em-3", text: "Assembled and installed thermohygrometers across multiple laboratory sites.", priority: 3, domainIds: ["vlsi", "rtl", "verification", "fpga", "embedded", "pcb"] },
        // Lower-priority fillers from the PCB_Design / Data_Analyst resume variants.
        { id: "exb-em-4", text: "Visited aluminium and power plants for energy meter testing and calibration.", priority: 4, domainIds: ["vlsi", "rtl", "verification", "fpga", "embedded", "pcb"] },
        { id: "exb-em-5", text: "Developed documentation and calibration reports aligned with NABL requirements.", priority: 5, domainIds: ["embedded", "pcb"] },
        { id: "exb-em-6", text: "Used Google Sheets and Apps Script to automate calibration report preparation.", priority: 6, domainIds: ["embedded", "pcb"] },
      ],
    },
  ],
  education: [
    { id: "edu-btech", degree: "Bachelor of Technology, ECE", institute: "Regent Education & Research Foundation, Barrackpore", startDate: "Aug 2022", endDate: "Jul 2025", score: "6.99 CGPA", location: "Barrackpore, India" },
    { id: "edu-diploma", degree: "Diploma, ECE", institute: "Birla Institute of Technology, Kolkata", startDate: "Aug 2019", endDate: "Jul 2022", score: "8.3 CGPA", location: "Kolkata, India" },
    { id: "edu-hs", degree: "Higher Secondary, Science", institute: "Serampore Union Institution", startDate: "May 2017", endDate: "Jun 2019", score: "67.20%", location: "Serampore, India" },
    { id: "edu-secondary", degree: "Secondary", institute: "Mahesh Sri Ramkrishna Ashram Vidyalaya (H.S.)", startDate: "Jan 2016", endDate: "Apr 2017", score: "78.42%", location: "India" },
  ],
  projects: [
    {
      id: "prj-apb-uart",
      title: "APB-Based UART VIP Verification",
      domainIds: ["vlsi", "verification"],
      sourceLink: "",
      tools: [],
      bullets: [
        { id: "prb-apb-1", text: "HDL: Verilog", priority: 1, domainIds: ["vlsi", "verification"] },
        { id: "prb-apb-2", text: "HVL: SystemVerilog", priority: 1, domainIds: ["vlsi", "verification"] },
        { id: "prb-apb-3", text: "TB Methodology: UVM", priority: 2, domainIds: ["vlsi", "verification"] },
        { id: "prb-apb-4", text: "EDA Tools: Synopsys VCS / Siemens QuestaSIM", priority: 2, domainIds: ["vlsi", "verification"] },
      ],
    },
    {
      id: "prj-router",
      title: "Router 1x3 : RTL Design and Verification",
      domainIds: ["vlsi", "rtl", "verification"],
      sourceLink: "",
      tools: [],
      bullets: [
        { id: "prb-router-1", text: "HDL: Verilog", priority: 1, domainIds: ["vlsi", "rtl", "verification"] },
        { id: "prb-router-2", text: "HVL: SystemVerilog", priority: 1, domainIds: ["vlsi", "rtl", "verification"] },
        { id: "prb-router-3", text: "TB Methodology: UVM", priority: 2, domainIds: ["vlsi", "verification"] },
        { id: "prb-router-4", text: "EDA Tools: Synopsys VCS / Siemens QuestaSIM", priority: 2, domainIds: ["vlsi", "rtl", "verification"] },
      ],
    },
    {
      id: "prj-alu",
      title: "UART-Controlled ALU with 1602 LCD Interface (FPGA + MCU)",
      domainIds: ["fpga", "embedded", "vlsi"],
      sourceLink: "https://docs.google.com/presentation/d/1IMYT21Ayt76YZjiRzkTRxsJMM55Byh3G/edit?usp=drive_link&ouid=109619323068373438228&rtpof=true&sd=true",
      tools: [],
      bullets: [
        { id: "prb-alu-1", text: "HDL: Verilog, Embedded C (MCU programming)", priority: 1, domainIds: ["fpga", "embedded", "vlsi"] },
        { id: "prb-alu-2", text: "HVL: SystemVerilog", priority: 1, domainIds: ["fpga", "vlsi"] },
        { id: "prb-alu-3", text: "Protocols: UART", priority: 2, domainIds: ["fpga", "embedded", "vlsi"] },
        { id: "prb-alu-4", text: "EDA Tools: ModelSim, Xilinx Vivado, Arduino IDE", priority: 2, domainIds: ["fpga", "embedded", "vlsi"] },
        // Descriptive fillers from the CV / PCB_Design resume variants.
        { id: "prb-alu-5", text: "Developed an 8-bit ALU in Verilog with UART serial input; computation results shown on a 1602 LCD and verified on an FPGA board.", priority: 3, domainIds: ["fpga", "embedded", "vlsi"] },
        { id: "prb-alu-6", text: "Integrated an ESP32 with the FPGA for seamless serial communication.", priority: 4, domainIds: ["fpga", "embedded", "vlsi"] },
      ],
    },
    // --- Projects sourced from github.com/ItzzInfinity (original, non-fork repos) ---
    {
      id: "prj-100rtl",
      title: "100 Days of RTL",
      domainIds: ["vlsi", "rtl", "verification", "fpga"],
      sourceLink: "https://github.com/ItzzInfinity/100-days-of-RTL",
      tools: ["Verilog", "ModelSim", "Vivado", "Quartus Prime", "Gowin EDA"],
      bullets: [
        { id: "prb-100rtl-1", text: "Designed and verified a new RTL block every day for 100 days straight — counters, FSMs, arbiters, and protocol blocks with self-checking testbenches.", priority: 1, domainIds: ["vlsi", "rtl", "verification", "fpga"] },
      ],
    },
    {
      id: "prj-verilog-practice",
      title: "Verilog Practice",
      domainIds: ["vlsi", "rtl"],
      sourceLink: "https://github.com/ItzzInfinity/Verilog-Practice",
      tools: ["Verilog"],
      bullets: [
        { id: "prb-vp-1", text: "Verilog implementations of digital circuits from Salivahanan's Digital Circuits & Design.", priority: 2, domainIds: ["vlsi", "rtl"] },
      ],
    },
    {
      id: "prj-spo2",
      title: "IoT Pulse Oximeter (SpO2 + Heart Rate)",
      domainIds: ["embedded", "pcb"],
      sourceLink: "https://github.com/ItzzInfinity/IoT-Based-SpO2-and-Pulse-Oximeter-with-MAX30102",
      tools: ["ESP8266", "MAX30102", "I2C", "SSD1306 OLED"],
      bullets: [
        { id: "prb-spo2-1", text: "Portable SpO2 and heart-rate monitor using an ESP8266 and MAX30102 bio-sensor over I2C with a live OLED readout.", priority: 1, domainIds: ["embedded", "pcb"] },
      ],
    },
    {
      id: "prj-siggen",
      title: "ESP32 Signal Generator",
      domainIds: ["embedded", "pcb"],
      sourceLink: "https://github.com/ItzzInfinity/Signal-Generator-Using-ESP32",
      tools: ["ESP32", "AD9833 DDS", "Wi-Fi", "I2C"],
      bullets: [
        { id: "prb-siggen-1", text: "Web-controlled DDS function generator (sine / square / triangle) built on an ESP32 driving an AD9833 module.", priority: 1, domainIds: ["embedded", "pcb"] },
        // Fillers from the PCB_Design / Embedded resume variants.
        { id: "prb-siggen-2", text: "Interfaced with the AD9833 over SPI, with frequency and waveform selection from a hosted web page or serial control.", priority: 3, domainIds: ["embedded", "pcb"] },
        { id: "prb-siggen-3", text: "Enabled signal tuning up to 1 MHz with stable output for lab testing and waveform analysis.", priority: 4, domainIds: ["embedded", "pcb"] },
      ],
    },
    {
      id: "prj-fmradio",
      title: "ESP FM Radio Receiver",
      domainIds: ["embedded", "pcb"],
      sourceLink: "https://github.com/ItzzInfinity/FM-Radio-Using-ESP-12E-and-RDA5807M",
      tools: ["ESP-12E", "RDA5807M", "PAM8403", "TP4056", "I2C"],
      bullets: [
        { id: "prb-fm-1", text: "Battery-powered FM receiver with ESP-12E + RDA5807M tuner, PAM8403 audio amplifier, and TP4056 Li-ion charging.", priority: 2, domainIds: ["embedded", "pcb"] },
      ],
    },
    {
      id: "prj-thermo",
      title: "Digital Thermohygrometer",
      domainIds: ["embedded"],
      sourceLink: "https://github.com/ItzzInfinity/The-most-Simple-Digital-Thermohygrometer",
      tools: ["ESP-01", "DHT11", "SSD1306 OLED"],
      bullets: [
        { id: "prb-thermo-1", text: "Temperature and humidity monitor with heat-index computation on an ESP-01, DHT11 sensor, and OLED display.", priority: 2, domainIds: ["embedded"] },
      ],
    },
    {
      id: "prj-clock",
      title: "WiFi NTP 7-Segment Clock",
      domainIds: ["embedded"],
      sourceLink: "https://github.com/ItzzInfinity/clock-project",
      tools: ["ESP32", "MAX7219", "SPI", "NTP"],
      bullets: [
        { id: "prb-clock-1", text: "WiFi-synchronized digital clock pulling NTP time and updating MAX7219 7-segment displays over SPI in real time.", priority: 2, domainIds: ["embedded"] },
      ],
    },
    // --- Projects recovered from the old Embedded / PCB_Design resume variants ---
    {
      id: "prj-soundbox",
      title: "Ultimate Pi Sound Box",
      domainIds: ["embedded"],
      sourceLink: "https://drive.google.com/drive/folders/16df-SWvkvvghtEMM3NwuqSKbPC6dCfM6?usp=sharing",
      tools: ["Raspberry Pi Zero 2W", "Python", "OLED", "Rotary Encoder"],
      bullets: [
        { id: "prb-sb-1", text: "Built a multifunctional sound box integrating internet radio, YouTube audio, and local playback on a Raspberry Pi Zero 2W.", priority: 2, domainIds: ["embedded"] },
        { id: "prb-sb-2", text: "Designed a GPIO-based user interface with OLED display and rotary encoder for navigation.", priority: 3, domainIds: ["embedded"] },
      ],
    },
    {
      id: "prj-sis",
      title: "SIS Report Downloader (Automation Tool)",
      domainIds: ["embedded"],
      sourceLink: "https://github.com/ItzzInfinity/tkinterSWv1.2",
      tools: ["Python", "Selenium", "Tkinter", "Pandas"],
      bullets: [
        { id: "prb-sis-1", text: "Automated multi-site login and CSV report downloads with Selenium, organized into date-based folders.", priority: 3, domainIds: ["embedded"] },
        { id: "prb-sis-2", text: "Built a Python GUI with per-store buttons, batch mode, and calendar-based selection for 15 stores.", priority: 4, domainIds: ["embedded"] },
        { id: "prb-sis-3", text: "Merged downloaded CSVs with Pandas and filesystem automation for consolidated analysis.", priority: 5, domainIds: ["embedded"] },
      ],
    },
    {
      id: "prj-framebuffer",
      title: "ESP ST7735 Framebuffer Driver",
      domainIds: ["embedded"],
      sourceLink: "https://github.com/ItzzInfinity/ESP-FrameBuffer",
      tools: ["ESP", "ST7735", "SPI", "C++"],
      bullets: [
        { id: "prb-fb-1", text: "Framebuffer display driver for a 1.8\" ST7735 TFT on ESP, enabling smoother partial-screen updates.", priority: 3, domainIds: ["embedded"] },
      ],
    },
  ],
  certifications: [
    {
      id: "cert-maven",
      name: "Advanced VLSI Design and Verification",
      issuer: "Maven Silicon Softech Pvt. Ltd.",
      date: "Jan 2025 - Dec 2026",
      credentialLink: "",
      domainIds: ["vlsi", "verification", "rtl", "fpga"],
    },
    // Udemy certifications recovered from the old Embedded / PCB_Design resumes.
    {
      id: "cert-excel-python",
      name: "Excel Files with Python",
      issuer: "Udemy",
      date: "",
      credentialLink: "https://www.udemy.com/certificate/UC-7240848d-0622-4017-8691-eb4af7895d22/",
      domainIds: ["embedded", "pcb"],
    },
    {
      id: "cert-linux",
      name: "Mastering Linux: The Complete Guide to Becoming a Linux Pro",
      issuer: "Udemy",
      date: "",
      credentialLink: "https://www.udemy.com/certificate/UC-95780f48-287c-4a73-ba89-545ab473682a/",
      domainIds: ["embedded", "pcb"],
    },
  ],
  awards: [
    { id: "awd-star", title: "Star of the Month", organization: "Maven Silicon", date: "May 2025", description: "For outstanding performance in the month of May.", domainIds: ["vlsi", "verification", "rtl"] },
    { id: "awd-100rtl", title: "Completed 100 Days of RTL", organization: "LinkedIn", date: "Dec 2024", description: "Created & verified an RTL design daily for 100 days straight. github.com/ItzzInfinity/100-days-of-RTL", domainIds: ["rtl", "vlsi", "verification"] },
  ],
  languages: [
    { id: "lang-en", name: "English", proficiency: "Professional" },
    { id: "lang-hi", name: "Hindi", proficiency: "Fluent" },
    { id: "lang-bn", name: "Bengali", proficiency: "Native" },
  ],
  hobbies: [
    { id: "hob-electronics", name: "Repairing consumer electronics and understanding how devices work" },
    { id: "hob-finance", name: "Actively learning finance and exploring investment concepts" },
  ],
  strengths: [
    { id: "str-debug", name: "Strong debugging across RTL, testbench, assertions, and waveform analysis" },
    { id: "str-analytical", name: "Analytical thinking and structured problem solving" },
    { id: "str-adaptable", name: "Adaptable to new tools, flows, and methodologies" },
    { id: "str-team", name: "Works independently and in cross-functional engineering teams" },
    { id: "str-detail", name: "Attention to detail" },
  ],
  references: [],
};
