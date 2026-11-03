import type { ImageMetadata } from "astro";
import fhWedel from "@/assets/logos/fh-wedel.png";
import novomindLogo from "@/assets/logos/novomind.png";
import tchiboLogo from "@/assets/logos/tchibo.png";
import thLuebeck from "@/assets/logos/th-luebeck.png";

// The About page (src/pages/about.astro) renders straight from this file.
// Logos live in src/assets/logos; an organisation without one gets an initials tile.

export interface Project {
  name: string;
  text: string;
  /** "Tech stack" of the project */
  stack?: string;
}

export interface Role {
  title: string;
  /** "Full-time", "Part-time", "Internship" ... */
  type?: string;
  period: string;
  duration: string;
  /** "Hybrid", "On-site", "Remote" */
  mode?: string;
  current?: boolean;
  summary?: string;
  bullets?: string[];
  outcome?: string;
  /** "References": notable projects of the role */
  projects?: Project[];
  skills?: string[];
}

export interface Company {
  company: string;
  /** website of the company, shown as a link */
  url?: string;
  logo?: ImageMetadata;
  /** employment type of the whole stay, e.g. "Full-time" */
  type?: string;
  duration?: string;
  location: string;
  mode?: string;
  roles: Role[];
}

export interface Education {
  degree: string;
  school: string;
  /** website of the school, shown as a link */
  schoolUrl?: string;
  logo?: ImageMetadata;
  period: string;
  grade: string;
  skills: string[];
}

export interface CVData {
  name: string;
  headline: string;
  location: string;
  /** Put your PDF in /public (e.g. public/aykut-oezdemir-cv.pdf) and set this path. */
  cvPdf: string;
  summary: string;
  experience: Company[];
  education: Education[];
  skillsTop: string[];
  skills: string[];
  languages: { name: string; level: string }[];
}

const TCHIBO_AI_SKILLS = [
  "Artificial Intelligence (AI)",
  "Machine Learning",
  "Natural Language Processing (NLP)",
  "Python",
  "Google Cloud Platform (GCP)",
  "Hugging Face",
  "Gitlab",
  "LLM",
  "Information Retrieval",
];

const NOVOMIND_AI_SKILLS = [
  "Machine Learning",
  "Java",
  "Python",
  "LLM",
  "MLOps",
  "Deep Learning",
  "spaCy",
  "MLflow",
  "Vue.js",
  "Git",
  "JavaScript",
  "Natural Language Processing (NLP)",
  "Artificial Intelligence (AI)",
  "Gitlab",
  "Hugging Face",
  "Azure OpenAI Service",
];

const LUEBECK_SKILLS = [
  "Machine Learning",
  "Python",
  "Natural Language Processing (NLP)",
  "Data Science",
  "Mobile Computing",
  "Git",
  "spaCy",
  "Internet Security",
];

const WEDEL_SKILLS = [
  "C++",
  "OpenGL",
  "OpenGL Shading Language (GLSL)",
  "OpenCV",
  "Java",
  "JavaScript",
  "After Effects",
  "Cascading Style Sheets (CSS)",
  "Pascal",
  "Image Processing",
  "HTML",
  "C (Programming Language)",
  "Adobe Photoshop",
  "Databases",
  "Computer Graphics",
];

const TCHIBO: Company = {
  company: "Tchibo GmbH",
  url: "https://www.tchibo.de",
  logo: tchiboLogo,
  type: "Full-time",
  duration: "2 yrs 8 mos",
  location: "Hamburg, Germany",
  mode: "Hybrid",
  roles: [
    {
      title: "Senior AI Engineer",
      period: "Sep 2025 – Present",
      duration: "1 yr 3 mos",
      current: true,
      skills: [
        "Artificial Intelligence (AI)",
        "Natural Language Processing (NLP)",
      ],
    },
    {
      title: "AI Engineer",
      period: "Apr 2024 – Aug 2025",
      duration: "1 yr 5 mos",
      summary:
        "I was responsible for developing an AI solution to improve Tchibo's website search functionality using LLMs. The project had two parts:",
      bullets: [
        "AI-based automated generation of search tags to significantly improve product discoverability across all international web shops.",
        "Fine-tuning and deploying a highly performant distilled custom embedding model based on sentence transformers, adapted to Tchibo's product catalog. For it I built Vertex AI pipelines that automated dataset generation, implemented hyperparameter optimization and set up automated evaluation to keep the model reliable.",
      ],
      outcome:
        "The solutions led to a significant, measurable increase in conversion rates.",
      skills: TCHIBO_AI_SKILLS,
    },
  ],
};

const NOVOMIND: Company = {
  company: "novomind AG",
  url: "https://www.novomind.com",
  logo: novomindLogo,
  duration: "7 yrs 7 mos",
  location: "Hamburg, Germany",
  roles: [
    {
      title: "Software Developer / AI Specialist",
      type: "Full-time",
      period: "Jan 2022 – Mar 2024",
      duration: "2 yrs 3 mos",
      mode: "Hybrid",
      summary:
        "In Customer Service I work with my team on developing and integrating AI applications into the novomind iAGENT product. Besides organisational tasks such as roadmap and ticket planning, I am technically responsible for consulting, development, evaluation and provisioning of AI-specific software. I also communicate AI-specific topics to stakeholders, both external customers and internal teams.",
      projects: [
        {
          name: "novomind iAGENT AI Agent Assist",
          text: "Integrating OpenAI's ChatGPT into the novomind iAGENT Desk simplifies the agents' daily work. For incoming customer emails it generates a summary, runs a tone analysis and drafts a fitting reply.",
          stack: "LangChain, Vue.js, Docker, Weaviate, Python, JavaScript",
        },
        {
          name: "QA chatbots based on LLMs such as Llama 2 and ChatGPT",
          text: "Implemented a Retrieval Augmented Generation (RAG) pipeline that uses an external knowledge base to answer domain-specific questions.",
          stack: "LlamaIndex, Hugging Face, Gradio, Semantic Search, Python",
        },
        {
          name: "Automatic classification and analysis of customer emails",
          text: "Based on the results of my master's thesis, a REST API was to be developed that can run configurable training and analysis pipelines.",
          stack:
            "Hugging Face, Scikit-Learn, MLflow, AutoML, XGBoost, BERT, ZenML, FastAPI, Docker, MinIO, MongoDB, ONNX, Python",
        },
      ],
      skills: NOVOMIND_AI_SKILLS,
    },
    {
      title: "Software Developer",
      type: "Part-time",
      period: "Oct 2017 – Dec 2021",
      duration: "4 yrs 3 mos",
      mode: "On-site",
      summary:
        "As part of the novomind iAGENT core team I was responsible for maintenance, documentation and further development of novomind iAGENT, novomind iAGENT Help and novomind iAGENT Composer.",
      projects: [
        {
          name: "novomind Social Media Gateway",
          text: "Developed a cloud platform that enables the integration of social media platforms such as Facebook or Instagram into novomind iAGENT.",
        },
        {
          name: "Order tracking for OTTO's chatbot “Clara”",
          text: "Integrated order tracking into the dialogue flow of OTTO's chatbot “Clara” using the OTTO Order Tracking API.",
        },
        {
          name: "novomind iAGENT Composer",
          text: "As part of a relaunch, the desktop application novomind iAGENT Composer was replaced by a web application.",
        },
      ],
      skills: ["Java", "Vue.js", "JavaScript", "OpenNLP"],
    },
    {
      title: "Working Student",
      type: "Work study",
      period: "Mar 2017 – Sep 2017",
      duration: "7 mos",
      mode: "On-site",
    },
    {
      title: "Student Intern",
      type: "Internship",
      period: "Sep 2016 – Feb 2017",
      duration: "6 mos",
      mode: "On-site",
    },
  ],
};

const AIRSYS: Company = {
  company: "AIRSYS - Airport Business Information Systems GmbH",
  location: "Hamburg, Germany",
  mode: "On-site",
  roles: [
    {
      title: "Working Student",
      type: "Work study",
      period: "Sep 2014 – Aug 2016",
      duration: "2 yrs",
      summary:
        "During the website relaunch of Hamburg Airport in 2014 I actively supported the project team. I planned and prepared website content based on the requirements of the departments, and trained departmental staff on the OpenText Content Management System.",
    },
  ],
};

const WHICEE: Company = {
  company: "whicee UG",
  location: "Hamburg, Germany",
  mode: "Remote",
  roles: [
    {
      title: "Frontend Developer",
      type: "Freelance",
      period: "May 2015 – Aug 2015",
      duration: "4 mos",
    },
  ],
};

export const CV: CVData = {
  name: "Aykut Özdemir",
  headline: "Senior AI Engineer at Tchibo GmbH",
  location: "Hamburg, Germany",
  cvPdf: "",
  summary:
    "I build LLM-based search for e-commerce: automated search tags, a fine-tuned distilled embedding model and the Vertex AI pipelines that train and evaluate it. Before that I spent seven years at novomind as a student, developer and AI specialist. M.Sc. in Media Informatics.",
  experience: [TCHIBO, NOVOMIND, AIRSYS, WHICEE],
  education: [
    {
      degree: "Master of Science, Medieninformatik Online",
      school: "Technische Hochschule Lübeck",
      schoolUrl: "https://www.th-luebeck.de",
      logo: thLuebeck,
      period: "Oct 2017 – Oct 2021",
      grade: "1.6 (GPA 3.4)",
      skills: LUEBECK_SKILLS,
    },
    {
      degree: "Bachelor of Science, Computer Games Technology",
      school: "Fachhochschule Wedel",
      schoolUrl: "https://www.fh-wedel.de",
      logo: fhWedel,
      period: "Oct 2014 – Sep 2017",
      grade: "1.8 (GPA 3.2)",
      skills: WEDEL_SKILLS,
    },
  ],
  skillsTop: [
    "Artificial Intelligence",
    "Machine Learning",
    "NLP",
    "LLM",
    "Python",
  ],
  skills: [
    "Information Retrieval",
    "Java",
    "JavaScript",
    "Vue.js",
    "MLOps",
    "Deep Learning",
    "Hugging Face",
    "spaCy",
    "MLflow",
    "Google Cloud Platform",
    "Vertex AI",
    "Azure OpenAI Service",
    "Git",
    "Gitlab",
    "C++",
    "OpenGL",
  ],
  languages: [],
};
