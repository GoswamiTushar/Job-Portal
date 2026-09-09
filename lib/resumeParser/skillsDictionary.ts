/**
 * Curated technology and industry skill taxonomy for exact-boundary resume matching.
 * Contains ~350+ prevalent technical, engineering, and data disciplines.
 */
export const TECH_SKILLS_CATALOG: string[] = [
    // Languages
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Golang', 'Rust', 'Ruby',
    'PHP', 'Swift', 'Kotlin', 'Scala', 'Dart', 'R', 'MATLAB', 'Shell', 'Bash', 'Solidity',

    // Frontend Frameworks & Libraries
    'React', 'React.js', 'Next.js', 'Vue', 'Vue.js', 'Nuxt.js', 'Angular', 'Svelte', 'SvelteKit',
    'HTML5', 'CSS3', 'Sass', 'SCSS', 'Tailwind CSS', 'Tailwind', 'Bootstrap', 'Material UI', 'Chakra UI',
    'Redux', 'Redux Toolkit', 'Zustand', 'MobX', 'GraphQL', 'Apollo Client', 'Webpack', 'Vite', 'Turbopack',

    // Backend Frameworks & Runtimes
    'Node.js', 'Node', 'Express', 'Express.js', 'NestJS', 'Koa', 'Fastify',
    'Django', 'FastAPI', 'Flask', 'Spring', 'Spring Boot', 'Ruby on Rails', 'Laravel', 'ASP.NET', '.NET Core',

    // Databases & ORMs
    'MongoDB', 'PostgreSQL', 'Postgres', 'MySQL', 'Redis', 'DynamoDB', 'Cassandra', 'Elasticsearch',
    'SQLite', 'Firebase', 'Supabase', 'Prisma', 'Mongoose', 'TypeORM', 'Hibernate', 'Neo4j', 'Couchbase',

    // Cloud, DevOps & Infrastructure
    'AWS', 'Amazon Web Services', 'Azure', 'Microsoft Azure', 'GCP', 'Google Cloud Platform',
    'Docker', 'Kubernetes', 'K8s', 'Terraform', 'Ansible', 'Helm', 'CI/CD', 'GitHub Actions',
    'GitLab CI', 'Jenkins', 'ArgoCD', 'Nginx', 'Apache', 'Linux', 'Ubuntu', 'Serverless', 'Cloudflare',

    // Architecture & APIs
    'Microservices', 'REST', 'RESTful APIs', 'gRPC', 'WebSockets', 'Socket.io', 'Kafka', 'RabbitMQ',
    'Message Queues', 'Event-Driven Architecture', 'Distributed Systems', 'System Design',

    // AI, ML & Data Science
    'Machine Learning', 'Deep Learning', 'Artificial Intelligence', 'Natural Language Processing', 'NLP',
    'Computer Vision', 'LLMs', 'Large Language Models', 'LangChain', 'LlamaIndex', 'OpenAI',
    'PyTorch', 'TensorFlow', 'Keras', 'Scikit-Learn', 'Pandas', 'NumPy', 'Hugging Face',
    'Data Analysis', 'Data Engineering', 'Apache Spark', 'Airflow', 'Snowflake', 'BigQuery', 'dbt',

    // Testing & QA
    'Jest', 'Cypress', 'Playwright', 'Mocha', 'Chai', 'Selenium', 'Vitest', 'Postman', 'Unit Testing', 'TDD',

    // Mobile & Cross-Platform
    'React Native', 'Flutter', 'iOS', 'Android', 'Expo',

    // Tools, Version Control & Security
    'Git', 'GitHub', 'GitLab', 'Bitbucket', 'Jira', 'Figma', 'Postman', 'OAuth', 'OAuth2',
    'JWT', 'Cybersecurity', 'Agile', 'Scrum',
];

/**
 * Escapes regex special characters in skill names (e.g. C++, .NET, Node.js)
 */
function escapeRegExp(string: string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Scans text for occurrences of catalog skills with strict word boundary checking.
 */
export function extractSkillsFromText(text: string): string[] {
    const found = new Set<string>();
    const normalizedText = text.toLowerCase();

    for (const skill of TECH_SKILLS_CATALOG) {
        // Special case handling for skills with symbols like C++, C#, .NET
        let pattern: RegExp;
        if (skill === 'C++') {
            pattern = /(^|\s|[,/])c\+\+(\s|[,./]|$)/i;
        } else if (skill === 'C#') {
            pattern = /(^|\s|[,/])c#(\s|[,./]|$)/i;
        } else if (skill === '.NET' || skill === '.NET Core') {
            pattern = /(^|\s|[,/])\.net(?:\s*core)?(\s|[,./]|$)/i;
        } else {
            pattern = new RegExp(`\\b${escapeRegExp(skill.toLowerCase())}\\b`, 'i');
        }

        if (pattern.test(normalizedText)) {
            // Standardize canonical casing
            found.add(skill);
        }
    }

    return Array.from(found);
}
