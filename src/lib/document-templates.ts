/**
 * Role-Based Document Templates
 * Provides customized JD generation and interview prep templates based on position category
 */

export interface RoleTemplate {
    category: string;
    jdTemplate: {
        overview: string;
        responsibilities: string[];
        qualifications: string[];
        techStack?: string[];
        niceTo: string[];
    };
    interviewTemplate: {
        rounds: { name: string; duration: string; focus: string }[];
        technicalQuestions: string[];
        behavioralQuestions: string[];
        practicalExercise?: string;
        evaluationCriteria: { criterion: string; weight: number; description: string }[];
        redFlags: string[];
        greenFlags: string[];
    };
}

export const roleTemplates: Record<string, RoleTemplate> = {
    'Engineering': {
        category: 'Engineering',
        jdTemplate: {
            overview: 'We are looking for a talented Software Engineer to join our engineering team and help build scalable, high-performance systems.',
            responsibilities: [
                'Design, develop, and maintain high-quality software solutions',
                'Collaborate with product and design teams to implement new features',
                'Write clean, testable, and well-documented code',
                'Participate in code reviews and contribute to engineering best practices',
                'Debug and optimize applications for performance and reliability',
                'Mentor junior developers and share technical knowledge',
            ],
            qualifications: [
                'Bachelor\'s degree in Computer Science or equivalent experience',
                'Strong proficiency in one or more programming languages',
                'Experience with modern development frameworks and tools',
                'Understanding of software design patterns and architecture',
                'Familiarity with version control systems (Git)',
                'Excellent problem-solving and analytical skills',
            ],
            techStack: ['JavaScript/TypeScript', 'React', 'Node.js', 'Python', 'AWS/GCP', 'SQL/NoSQL'],
            niceTo: [
                'Experience with microservices architecture',
                'Knowledge of CI/CD pipelines',
                'Contributions to open-source projects',
                'Experience with Agile/Scrum methodologies',
            ],
        },
        interviewTemplate: {
            rounds: [
                { name: 'Technical Screening', duration: '45 min', focus: 'Coding fundamentals and problem-solving' },
                { name: 'System Design', duration: '60 min', focus: 'Architecture and scalability thinking' },
                { name: 'Coding Challenge', duration: '90 min', focus: 'Live coding with real-world problem' },
                { name: 'Team & Culture Fit', duration: '45 min', focus: 'Collaboration and communication' },
            ],
            technicalQuestions: [
                'Explain the difference between REST and GraphQL. When would you choose one over the other?',
                'How would you design a caching strategy for a high-traffic application?',
                'Describe your approach to debugging a production issue.',
                'What are the trade-offs between SQL and NoSQL databases?',
                'How do you ensure code quality in your projects?',
            ],
            behavioralQuestions: [
                'Tell me about a time you disagreed with a technical decision. How did you handle it?',
                'Describe a challenging bug you fixed. What was your approach?',
                'How do you stay updated with new technologies?',
                'Tell me about a project you\'re most proud of.',
            ],
            practicalExercise: 'Build a simple API endpoint that handles user authentication with proper error handling.',
            evaluationCriteria: [
                { criterion: 'Technical Skills', weight: 35, description: 'Coding ability, system design, technical depth' },
                { criterion: 'Problem Solving', weight: 25, description: 'Approach to complex problems, debugging skills' },
                { criterion: 'Communication', weight: 20, description: 'Clarity in explaining technical concepts' },
                { criterion: 'Culture Fit', weight: 20, description: 'Team collaboration, growth mindset' },
            ],
            redFlags: [
                'Unable to explain past work clearly',
                'Dismissive of code reviews or feedback',
                'No curiosity about the tech stack or product',
                'Blames others for past failures',
            ],
            greenFlags: [
                'Asks thoughtful questions about architecture',
                'Shows enthusiasm for learning new technologies',
                'Takes ownership of past mistakes',
                'Has side projects or open-source contributions',
            ],
        },
    },

    'Product Management': {
        category: 'Product Management',
        jdTemplate: {
            overview: 'We are seeking a Product Manager to lead product strategy and drive the development of innovative solutions that delight our customers.',
            responsibilities: [
                'Define product vision, strategy, and roadmap',
                'Gather and prioritize product requirements based on customer needs',
                'Work closely with engineering, design, and marketing teams',
                'Analyze market trends and competitive landscape',
                'Define and track product KPIs and success metrics',
                'Communicate product updates to stakeholders',
            ],
            qualifications: [
                'Bachelor\'s degree in Business, Engineering, or related field',
                '3+ years of product management experience',
                'Strong analytical and problem-solving skills',
                'Excellent communication and presentation abilities',
                'Experience with Agile product development',
                'Data-driven decision-making mindset',
            ],
            niceTo: [
                'MBA or advanced degree',
                'Technical background or coding experience',
                'Experience in B2B or B2C SaaS products',
                'Track record of launching successful products',
            ],
        },
        interviewTemplate: {
            rounds: [
                { name: 'Product Sense', duration: '45 min', focus: 'Product intuition and customer empathy' },
                { name: 'Case Study', duration: '60 min', focus: 'Strategic thinking and problem analysis' },
                { name: 'Technical Discussion', duration: '45 min', focus: 'Working with engineering teams' },
                { name: 'Leadership Interview', duration: '45 min', focus: 'Stakeholder management and influence' },
            ],
            technicalQuestions: [
                'How would you prioritize features with limited engineering resources?',
                'Walk me through how you would launch a new product feature.',
                'How do you measure the success of a product?',
                'Describe your approach to writing product requirements.',
            ],
            behavioralQuestions: [
                'Tell me about a product decision you made that failed. What did you learn?',
                'How do you handle conflicting priorities from different stakeholders?',
                'Describe a time you had to say no to a customer request.',
                'How do you build relationships with engineering teams?',
            ],
            evaluationCriteria: [
                { criterion: 'Product Sense', weight: 30, description: 'User empathy, market understanding' },
                { criterion: 'Strategic Thinking', weight: 25, description: 'Long-term vision, prioritization' },
                { criterion: 'Execution', weight: 25, description: 'Getting things done, attention to detail' },
                { criterion: 'Leadership', weight: 20, description: 'Influence, communication, stakeholder management' },
            ],
            redFlags: [
                'Cannot articulate product metrics',
                'Focuses only on features, not outcomes',
                'Poor understanding of technical constraints',
                'Lacks customer empathy',
            ],
            greenFlags: [
                'Deep customer research experience',
                'Data-driven with strong intuition',
                'Collaborative approach with engineering',
                'Clear communication style',
            ],
        },
    },

    'UX Design': {
        category: 'UX Design',
        jdTemplate: {
            overview: 'We are looking for a UX Designer to create intuitive, beautiful user experiences that solve real problems and delight our users.',
            responsibilities: [
                'Conduct user research and usability testing',
                'Create wireframes, prototypes, and high-fidelity designs',
                'Develop and maintain design systems',
                'Collaborate with product and engineering teams',
                'Advocate for user-centered design principles',
                'Present design concepts to stakeholders',
            ],
            qualifications: [
                'Bachelor\'s degree in Design, HCI, or related field',
                '3+ years of UX/UI design experience',
                'Strong portfolio demonstrating design process',
                'Proficiency in Figma, Sketch, or similar tools',
                'Understanding of accessibility standards',
                'Excellent visual design skills',
            ],
            niceTo: [
                'Experience with design systems',
                'Motion design or animation skills',
                'Basic front-end development knowledge',
                'Experience with user research methods',
            ],
        },
        interviewTemplate: {
            rounds: [
                { name: 'Portfolio Review', duration: '60 min', focus: 'Design process and thinking' },
                { name: 'Design Challenge', duration: '90 min', focus: 'Problem-solving and creativity' },
                { name: 'Collaboration Session', duration: '45 min', focus: 'Working with product and engineering' },
                { name: 'Culture Fit', duration: '30 min', focus: 'Team dynamics and values alignment' },
            ],
            technicalQuestions: [
                'Walk me through your design process for a recent project.',
                'How do you handle conflicting feedback from stakeholders?',
                'Describe how you approach accessibility in your designs.',
                'How do you validate design decisions with users?',
            ],
            behavioralQuestions: [
                'Tell me about a design you\'re most proud of and why.',
                'Describe a time when user research changed your design direction.',
                'How do you stay updated with design trends?',
                'How do you handle tight deadlines without compromising quality?',
            ],
            practicalExercise: 'Design a mobile app onboarding flow for a new user. Focus on clarity and engagement.',
            evaluationCriteria: [
                { criterion: 'Design Skills', weight: 35, description: 'Visual design, interaction design, prototyping' },
                { criterion: 'User Empathy', weight: 25, description: 'Research skills, understanding user needs' },
                { criterion: 'Process', weight: 20, description: 'Structured approach, iteration' },
                { criterion: 'Collaboration', weight: 20, description: 'Working with cross-functional teams' },
            ],
            redFlags: [
                'No clear design rationale',
                'Defensive about feedback',
                'Focuses only on aesthetics, not usability',
                'Cannot explain trade-offs in designs',
            ],
            greenFlags: [
                'Strong user research foundation',
                'Iterative design approach',
                'Balance of aesthetics and usability',
                'Curiosity about user behavior',
            ],
        },
    },

    'QA': {
        category: 'QA',
        jdTemplate: {
            overview: 'We are seeking a QA Engineer to ensure product quality through comprehensive testing strategies and automation.',
            responsibilities: [
                'Develop and execute test plans and test cases',
                'Build and maintain automated test suites',
                'Identify, document, and track bugs',
                'Collaborate with developers to resolve issues',
                'Participate in sprint planning and code reviews',
                'Advocate for quality throughout the development lifecycle',
            ],
            qualifications: [
                'Bachelor\'s degree in Computer Science or related field',
                '2+ years of QA or testing experience',
                'Experience with test automation frameworks',
                'Strong understanding of SDLC and testing methodologies',
                'Attention to detail and analytical mindset',
                'Excellent communication skills',
            ],
            techStack: ['Selenium', 'Cypress', 'Jest', 'Postman', 'JIRA', 'Git'],
            niceTo: [
                'Experience with performance testing',
                'Knowledge of CI/CD pipelines',
                'Security testing experience',
                'Mobile app testing experience',
            ],
        },
        interviewTemplate: {
            rounds: [
                { name: 'Technical Screening', duration: '45 min', focus: 'Testing fundamentals and automation' },
                { name: 'Practical Test', duration: '60 min', focus: 'Test case design and execution' },
                { name: 'Team Interview', duration: '45 min', focus: 'Collaboration and communication' },
            ],
            technicalQuestions: [
                'Explain the difference between unit, integration, and E2E tests.',
                'How do you prioritize which tests to automate?',
                'Describe your approach to testing a new feature.',
                'What metrics do you use to measure test effectiveness?',
            ],
            behavioralQuestions: [
                'Tell me about a critical bug you found. How did you approach it?',
                'How do you handle pushback from developers on bug reports?',
                'Describe a time when you improved the testing process.',
            ],
            evaluationCriteria: [
                { criterion: 'Testing Skills', weight: 35, description: 'Test design, automation, bug detection' },
                { criterion: 'Technical Knowledge', weight: 25, description: 'Tools, frameworks, methodologies' },
                { criterion: 'Attention to Detail', weight: 20, description: 'Thoroughness, edge case thinking' },
                { criterion: 'Communication', weight: 20, description: 'Bug reporting, collaboration' },
            ],
            redFlags: [
                'No automation experience',
                'Cannot explain testing strategy',
                'Adversarial attitude toward developers',
                'Misses obvious edge cases',
            ],
            greenFlags: [
                'Strong automation skills',
                'Proactive bug prevention mindset',
                'Collaborative approach',
                'Continuous improvement focus',
            ],
        },
    },

    'SRE': {
        category: 'SRE',
        jdTemplate: {
            overview: 'We are looking for a Site Reliability Engineer to ensure our systems are reliable, scalable, and performant.',
            responsibilities: [
                'Design and implement reliable infrastructure',
                'Monitor system health and respond to incidents',
                'Automate operational tasks and deployments',
                'Define and track SLIs, SLOs, and error budgets',
                'Conduct post-mortems and implement improvements',
                'Collaborate with development teams on reliability',
            ],
            qualifications: [
                'Bachelor\'s degree in Computer Science or related field',
                '3+ years of SRE or DevOps experience',
                'Strong programming skills (Python, Go, or similar)',
                'Experience with cloud platforms (AWS, GCP, Azure)',
                'Knowledge of containerization and orchestration',
                'Understanding of networking and security',
            ],
            techStack: ['Kubernetes', 'Docker', 'Terraform', 'Prometheus', 'Grafana', 'AWS/GCP'],
            niceTo: [
                'Experience with chaos engineering',
                'Database administration experience',
                'Security engineering background',
                'Large-scale system experience',
            ],
        },
        interviewTemplate: {
            rounds: [
                { name: 'Technical Screening', duration: '45 min', focus: 'Systems knowledge and coding' },
                { name: 'Design Review', duration: '60 min', focus: 'Infrastructure design and reliability' },
                { name: 'Incident Response', duration: '45 min', focus: 'Problem-solving under pressure' },
                { name: 'Team Interview', duration: '45 min', focus: 'Collaboration and on-call mindset' },
            ],
            technicalQuestions: [
                'How would you design a highly available web service?',
                'Explain SLIs, SLOs, and error budgets.',
                'Describe your approach to incident response.',
                'How do you balance feature work with reliability work?',
            ],
            behavioralQuestions: [
                'Tell me about a major incident you handled. What was your role?',
                'How do you prioritize when multiple systems are failing?',
                'Describe a time when you improved system reliability.',
            ],
            evaluationCriteria: [
                { criterion: 'Systems Knowledge', weight: 35, description: 'Infrastructure, networking, security' },
                { criterion: 'Problem Solving', weight: 25, description: 'Debugging, root cause analysis' },
                { criterion: 'Automation', weight: 20, description: 'Scripting, IaC, CI/CD' },
                { criterion: 'Collaboration', weight: 20, description: 'Working with dev teams, on-call attitude' },
            ],
            redFlags: [
                'No incident response experience',
                'Cannot explain reliability concepts',
                'Averse to on-call responsibilities',
                'Manual-first approach',
            ],
            greenFlags: [
                'Strong incident response skills',
                'Automation mindset',
                'Blameless culture advocate',
                'Proactive reliability improvements',
            ],
        },
    },

    'DevOps': {
        category: 'DevOps',
        jdTemplate: {
            overview: 'We are seeking a DevOps Engineer to build and maintain our CI/CD pipelines and cloud infrastructure.',
            responsibilities: [
                'Design and implement CI/CD pipelines',
                'Manage cloud infrastructure and services',
                'Automate deployment and configuration management',
                'Monitor system performance and availability',
                'Implement security best practices',
                'Collaborate with development teams',
            ],
            qualifications: [
                'Bachelor\'s degree in Computer Science or related field',
                '2+ years of DevOps experience',
                'Strong scripting skills (Bash, Python)',
                'Experience with cloud platforms',
                'Knowledge of containerization (Docker, Kubernetes)',
                'Understanding of networking and security',
            ],
            techStack: ['Jenkins', 'GitHub Actions', 'Docker', 'Kubernetes', 'Terraform', 'Ansible'],
            niceTo: [
                'Certifications (AWS, GCP, Azure)',
                'Experience with GitOps',
                'Security automation experience',
                'Platform engineering background',
            ],
        },
        interviewTemplate: {
            rounds: [
                { name: 'Technical Screening', duration: '45 min', focus: 'DevOps fundamentals and tools' },
                { name: 'Practical Exercise', duration: '60 min', focus: 'Pipeline design and troubleshooting' },
                { name: 'Team Interview', duration: '45 min', focus: 'Collaboration and culture fit' },
            ],
            technicalQuestions: [
                'Explain the CI/CD pipeline you would design for a microservices application.',
                'How do you handle secrets management?',
                'Describe your approach to infrastructure as code.',
                'What monitoring and alerting do you set up for production systems?',
            ],
            behavioralQuestions: [
                'Tell me about a failed deployment. How did you handle it?',
                'How do you balance speed with security?',
                'Describe a time when you improved deployment frequency.',
            ],
            evaluationCriteria: [
                { criterion: 'Technical Skills', weight: 35, description: 'CI/CD, cloud, containerization' },
                { criterion: 'Automation', weight: 25, description: 'IaC, scripting, pipeline design' },
                { criterion: 'Problem Solving', weight: 20, description: 'Troubleshooting, debugging' },
                { criterion: 'Collaboration', weight: 20, description: 'Working with dev teams' },
            ],
            redFlags: [
                'No CI/CD experience',
                'Manual deployment preference',
                'Poor security awareness',
                'Cannot explain infrastructure concepts',
            ],
            greenFlags: [
                'Strong automation skills',
                'Security-first mindset',
                'Collaborative approach',
                'Continuous improvement focus',
            ],
        },
    },
};

// Default template for categories not explicitly defined
export const defaultTemplate: RoleTemplate = {
    category: 'General',
    jdTemplate: {
        overview: 'We are looking for a talented professional to join our team and contribute to our mission.',
        responsibilities: [
            'Collaborate with cross-functional teams',
            'Contribute to projects and initiatives',
            'Communicate effectively with stakeholders',
            'Drive continuous improvement',
            'Stay updated with industry trends',
        ],
        qualifications: [
            'Relevant degree or equivalent experience',
            'Strong communication skills',
            'Problem-solving abilities',
            'Team player with positive attitude',
            'Ability to work in a fast-paced environment',
        ],
        niceTo: [
            'Previous experience in a similar role',
            'Domain expertise',
            'Leadership experience',
        ],
    },
    interviewTemplate: {
        rounds: [
            { name: 'Screening', duration: '30 min', focus: 'Background and experience' },
            { name: 'Technical/Skills', duration: '45 min', focus: 'Role-specific competencies' },
            { name: 'Culture Fit', duration: '30 min', focus: 'Values and team dynamics' },
        ],
        technicalQuestions: [
            'Walk me through your relevant experience.',
            'Describe a challenging project you completed.',
            'How do you approach problem-solving?',
            'What motivates you in your work?',
        ],
        behavioralQuestions: [
            'Tell me about a time you worked on a team.',
            'Describe a conflict you resolved.',
            'How do you handle feedback?',
            'What are your career goals?',
        ],
        evaluationCriteria: [
            { criterion: 'Skills', weight: 30, description: 'Role-specific competencies' },
            { criterion: 'Experience', weight: 25, description: 'Relevant background' },
            { criterion: 'Communication', weight: 25, description: 'Clarity and effectiveness' },
            { criterion: 'Culture Fit', weight: 20, description: 'Values alignment' },
        ],
        redFlags: [
            'Inconsistencies in experience claims',
            'Poor communication skills',
            'Negative attitude about past employers',
            'Lack of curiosity about the role',
        ],
        greenFlags: [
            'Asks thoughtful questions',
            'Shows enthusiasm for the opportunity',
            'Takes ownership of past work',
            'Demonstrates growth mindset',
        ],
    },
};

/**
 * Get the template for a specific category
 */
export function getTemplateForCategory(category: string): RoleTemplate {
    return roleTemplates[category] || defaultTemplate;
}

/**
 * Generate a customized JD based on category and key requirements
 */
export function generateCustomizedJD(
    category: string,
    keyRequirements: string,
    companyContext?: string
): string {
    const template = getTemplateForCategory(category);

    let jd = `## Position Overview\n\n${template.jdTemplate.overview}`;

    if (companyContext) {
        jd += `\n\n${companyContext}`;
    }

    jd += `\n\n## Key Responsibilities\n\n`;
    template.jdTemplate.responsibilities.forEach(resp => {
        jd += `- ${resp}\n`;
    });

    jd += `\n## Required Qualifications\n\n`;
    template.jdTemplate.qualifications.forEach(qual => {
        jd += `- ${qual}\n`;
    });

    if (keyRequirements) {
        jd += `\n### Additional Requirements\n\n${keyRequirements}`;
    }

    if (template.jdTemplate.techStack && template.jdTemplate.techStack.length > 0) {
        jd += `\n\n## Tech Stack\n\n`;
        jd += template.jdTemplate.techStack.join(' • ');
    }

    jd += `\n\n## Nice to Have\n\n`;
    template.jdTemplate.niceTo.forEach(nice => {
        jd += `- ${nice}\n`;
    });

    jd += `\n## What We Offer\n\n`;
    jd += `- Competitive compensation package\n`;
    jd += `- Flexible work arrangements\n`;
    jd += `- Professional development opportunities\n`;
    jd += `- Collaborative and inclusive culture\n`;
    jd += `- Health and wellness benefits\n`;

    return jd;
}

/**
 * Generate a customized interview prep document based on category
 */
export function generateCustomizedInterviewPrep(category: string): string {
    const template = getTemplateForCategory(category);

    let doc = `# Interview Preparation Document\n\n`;
    doc += `## Interview Structure\n\n`;

    template.interviewTemplate.rounds.forEach((round, index) => {
        doc += `### Round ${index + 1}: ${round.name} (${round.duration})\n`;
        doc += `- Focus: ${round.focus}\n\n`;
    });

    doc += `---\n\n## Suggested Interview Questions\n\n`;

    doc += `### Technical Questions\n`;
    template.interviewTemplate.technicalQuestions.forEach((q, i) => {
        doc += `${i + 1}. ${q}\n`;
    });

    doc += `\n### Behavioral Questions\n`;
    template.interviewTemplate.behavioralQuestions.forEach((q, i) => {
        doc += `${i + 1}. ${q}\n`;
    });

    if (template.interviewTemplate.practicalExercise) {
        doc += `\n### Practical Exercise\n`;
        doc += `${template.interviewTemplate.practicalExercise}\n`;
    }

    doc += `\n---\n\n## Evaluation Criteria\n\n`;
    doc += `| Criterion | Weight | Description |\n`;
    doc += `|-----------|--------|-------------|\n`;
    template.interviewTemplate.evaluationCriteria.forEach(crit => {
        doc += `| ${crit.criterion} | ${crit.weight}% | ${crit.description} |\n`;
    });

    doc += `\n---\n\n## Red Flags to Watch For\n`;
    template.interviewTemplate.redFlags.forEach(flag => {
        doc += `- ${flag}\n`;
    });

    doc += `\n## Green Flags\n`;
    template.interviewTemplate.greenFlags.forEach(flag => {
        doc += `- ${flag}\n`;
    });

    return doc;
}
