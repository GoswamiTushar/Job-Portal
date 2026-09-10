import React, { useState, useEffect, useRef } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import Link from 'next/link';
import MyJobMetaData from '../../components/MyJobMetaData';
import Toast from '../../components/Toast';
import Loader from '../../components/Loader';
import styles from './styles.module.scss';

interface WorkExp {
    title: string;
    company: string;
    startDate?: string;
    endDate?: string;
    isCurrent?: boolean;
    description?: string;
}

interface Education {
    degree: string;
    institution: string;
    fieldOfStudy?: string;
    startYear?: string;
    endYear?: string;
}

interface CandidateProfileState {
    name: string;
    email: string;
    phone: string;
    location: string;
    headline: string;
    bio: string;
    skills: string[];
    experienceLevel: string;
    experienceYears: string;
    noticePeriod: string;
    expectedSalary: string;
    workplacePreference: string;
    workExperience: WorkExp[];
    education: Education[];
    links: {
        linkedin: string;
        github: string;
        portfolio: string;
        twitter: string;
    };
    resume: {
        fileName?: string;
        fileSize?: number;
        fileType?: string;
        uploadedAt?: string;
    } | null;
}

const POPULAR_SKILLS = [
    'React', 'Next.js', 'TypeScript', 'Node.js', 'Python', 'AWS',
    'Docker', 'MongoDB', 'PostgreSQL', 'GraphQL', 'Tailwind CSS', 'Redis'
];

const ProfilePage: NextPage = () => {
    const router = useRouter();
    const [profile, setProfile] = useState<CandidateProfileState>({
        name: '',
        email: '',
        phone: '',
        location: '',
        headline: '',
        bio: '',
        skills: [],
        experienceLevel: 'Mid-Level',
        experienceYears: '',
        noticePeriod: '30 Days',
        expectedSalary: '',
        workplacePreference: 'Remote',
        workExperience: [],
        education: [],
        links: { linkedin: '', github: '', portfolio: '', twitter: '' },
        resume: null,
    });

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<'success' | 'danger'>('success');
    const [toastOpen, setToastOpen] = useState(false);

    // Modal States
    const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);
    const [isLinkedInModalOpen, setIsLinkedInModalOpen] = useState(false);
    const [isParsingResume, setIsParsingResume] = useState(false);
    const [parseFeedback, setParseFeedback] = useState<string | null>(null);

    // Inline Editor States
    const [newSkill, setNewSkill] = useState('');
    const [showExpForm, setShowExpForm] = useState(false);
    const [expDraft, setExpDraft] = useState<WorkExp>({
        title: '',
        company: '',
        startDate: '',
        endDate: '',
        isCurrent: false,
        description: '',
    });

    const [showEduForm, setShowEduForm] = useState(false);
    const [eduDraft, setEduDraft] = useState<Education>({
        degree: '',
        institution: '',
        fieldOfStudy: '',
        startYear: '',
        endYear: '',
    });

    const fileInputRef = useRef<HTMLInputElement>(null);

    const showToast = (message: string, type: 'success' | 'danger' = 'success') => {
        setToastMessage(message);
        setToastType(type);
        setToastOpen(true);
        setTimeout(() => setToastOpen(false), 3500);
    };

    // 1. Fetch Profile Data on Mount
    useEffect(() => {
        const fetchProfile = async () => {
            setIsLoading(true);
            try {
                const res = await fetch('/api/candidates/profile');
                if (res.ok) {
                    const data = await res.json();
                    if (data.profile) {
                        setProfile((prev) => ({
                            ...prev,
                            ...data.profile,
                            links: { ...prev.links, ...(data.profile.links || {}) },
                            skills: data.profile.skills || [],
                            workExperience: data.profile.workExperience || [],
                            education: data.profile.education || [],
                        }));
                    }
                } else if (res.status === 401) {
                    window.location.href = '/login';
                }
            } catch (err) {
                console.error('Error fetching profile:', err);
                showToast('Failed to load profile data', 'danger');
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfile();
    }, []);

    // 1.1 Handle OAuth callback notifications from URL params
    useEffect(() => {
        if (!router.isReady) return;

        if (router.query.linkedin === 'synced') {
            showToast('🎉 LinkedIn account connected & synced via OAuth 2.0!', 'success');
            // Re-fetch profile to load imported avatar and details
            fetch('/api/candidates/profile')
                .then((r) => r.json())
                .then((data) => {
                    if (data.profile) {
                        setProfile((prev) => ({
                            ...prev,
                            ...data.profile,
                            links: { ...prev.links, ...(data.profile.links || {}) },
                            skills: data.profile.skills || [],
                        }));
                    }
                })
                .catch(() => {});
            router.replace('/profile', undefined, { shallow: true });
        } else if (router.query.linkedin_error === 'config_missing') {
            showToast('LinkedIn OAuth 2.0 requires LINKEDIN_CLIENT_ID in .env file', 'danger');
            setIsLinkedInModalOpen(true);
            router.replace('/profile', undefined, { shallow: true });
        } else if (router.query.linkedin_error === 'cancelled') {
            showToast('LinkedIn OAuth authorization was cancelled.', 'danger');
            router.replace('/profile', undefined, { shallow: true });
        } else if (router.query.linkedin_error) {
            showToast(`LinkedIn OAuth error: ${router.query.linkedin_error}`, 'danger');
            router.replace('/profile', undefined, { shallow: true });
        }
    }, [router.isReady, router.query]);

    // 2. Save Profile Data
    const handleSaveProfile = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setIsSaving(true);
        try {
            const res = await fetch('/api/candidates/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(profile),
            });

            const data = await res.json();
            if (res.ok && data.success) {
                showToast('Profile saved successfully! Ready for job applications.', 'success');
            } else {
                showToast(data.message || 'Error saving profile', 'danger');
            }
        } catch (err) {
            console.error('Save profile error:', err);
            showToast('Network error while saving profile', 'danger');
        } finally {
            setIsSaving(false);
        }
    };

    // 3. Resume Upload & Extraction
    const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 8 * 1024 * 1024) {
            showToast('File exceeds 8MB limit. Please upload a smaller resume.', 'danger');
            return;
        }

        const formData = new FormData();
        formData.append('resume', file);

        setIsParsingResume(true);
        setParseFeedback('Uploading document & initializing memory-efficient decoders...');

        try {
            const res = await fetch('/api/candidates/resume-parse', {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();

            if (res.ok && data.success && data.profile) {
                const p = data.profile;
                setProfile((prev) => ({
                    ...prev,
                    name: p.name || prev.name,
                    email: p.email || prev.email,
                    phone: p.phone || prev.phone,
                    location: p.location || prev.location,
                    headline: p.headline || prev.headline,
                    bio: p.bio || prev.bio,
                    skills: Array.from(new Set([...prev.skills, ...(p.skills || [])])),
                    experienceLevel: p.experienceLevel || prev.experienceLevel,
                    experienceYears: p.experienceYears || prev.experienceYears,
                    workExperience: p.workExperience?.length ? p.workExperience : prev.workExperience,
                    education: p.education?.length ? p.education : prev.education,
                    links: {
                        linkedin: p.links?.linkedin || prev.links.linkedin,
                        github: p.links?.github || prev.links.github,
                        portfolio: p.links?.portfolio || prev.links.portfolio,
                        twitter: prev.links.twitter,
                    },
                    resume: {
                        fileName: data.fileName,
                        fileSize: data.fileSize,
                        fileType: data.fileType,
                        uploadedAt: new Date().toISOString(),
                    },
                }));

                const parsedCount = (p.skills?.length || 0) + (p.workExperience?.length || 0) + (p.education?.length || 0);
                showToast(`Resume parsed successfully! Extracted ${parsedCount} profile entities.`, 'success');
                setIsResumeModalOpen(false);
            } else {
                showToast(data.message || 'Could not parse resume.', 'danger');
            }
        } catch (err: any) {
            console.error('Upload error:', err);
            showToast('Failed to upload and parse resume', 'danger');
        } finally {
            setIsParsingResume(false);
            setParseFeedback(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    // 4. LinkedIn OAuth 2.0 Integration
    const [isSimulatingSync, setIsSimulatingSync] = useState(false);

    const handleInitiateLinkedInOAuth = () => {
        window.location.href = '/api/auth/oauth/linkedin?action=sync';
    };

    const handleSimulateLinkedInSync = async () => {
        setIsSimulatingSync(true);
        try {
            const simulatedHandle = profile.name
                ? profile.name.toLowerCase().replace(/\s+/g, '-')
                : 'developer-pro';
            const simulatedLinkedInUrl = `https://www.linkedin.com/in/${simulatedHandle}`;

            const updatedProfile = {
                ...profile,
                headline: profile.headline || 'Full Stack Engineer & Tech Specialist',
                links: {
                    ...profile.links,
                    linkedin: profile.links.linkedin || simulatedLinkedInUrl,
                },
            };
            setProfile(updatedProfile);

            // Persist to backend modular models
            await fetch('/api/candidates/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedProfile),
            });

            showToast('Simulated LinkedIn OAuth sync completed!', 'success');
            setIsLinkedInModalOpen(false);
        } catch (err) {
            console.error('Simulated LinkedIn sync error:', err);
            showToast('Failed to simulate sync', 'danger');
        } finally {
            setIsSimulatingSync(false);
        }
    };

    // Skill Tag Management
    const handleAddSkill = (skillToAdd: string) => {
        const trimmed = skillToAdd.trim();
        if (!trimmed) return;
        if (!profile.skills.includes(trimmed)) {
            setProfile((prev) => ({
                ...prev,
                skills: [...prev.skills, trimmed],
            }));
        }
        setNewSkill('');
    };

    const handleRemoveSkill = (skillToRemove: string) => {
        setProfile((prev) => ({
            ...prev,
            skills: prev.skills.filter((s) => s !== skillToRemove),
        }));
    };

    // Work Experience Management
    const handleAddExperience = () => {
        if (!expDraft.title.trim() || !expDraft.company.trim()) {
            showToast('Please enter job title and company name.', 'danger');
            return;
        }
        setProfile((prev) => ({
            ...prev,
            workExperience: [...prev.workExperience, { ...expDraft }],
        }));
        setExpDraft({ title: '', company: '', startDate: '', endDate: '', isCurrent: false, description: '' });
        setShowExpForm(false);
    };

    const handleRemoveExperience = (index: number) => {
        setProfile((prev) => ({
            ...prev,
            workExperience: prev.workExperience.filter((_, i) => i !== index),
        }));
    };

    // Education Management
    const handleAddEducation = () => {
        if (!eduDraft.degree.trim() || !eduDraft.institution.trim()) {
            showToast('Please enter degree and institution.', 'danger');
            return;
        }
        setProfile((prev) => ({
            ...prev,
            education: [...prev.education, { ...eduDraft }],
        }));
        setEduDraft({ degree: '', institution: '', fieldOfStudy: '', startYear: '', endYear: '' });
        setShowEduForm(false);
    };

    const handleRemoveEducation = (index: number) => {
        setProfile((prev) => ({
            ...prev,
            education: prev.education.filter((_, i) => i !== index),
        }));
    };

    // Profile Completeness Calculation
    const calculateCompleteness = () => {
        let score = 0;
        if (profile.name && profile.email) score += 20;
        if (profile.phone && profile.location) score += 15;
        if (profile.headline) score += 15;
        if (profile.skills.length >= 3) score += 20;
        if (profile.workExperience.length >= 1) score += 15;
        if (profile.education.length >= 1) score += 10;
        if (profile.links.linkedin || profile.links.github) score += 5;
        return Math.min(score, 100);
    };

    const completenessScore = calculateCompleteness();

    return (
        <section className={`w_container ${styles['profile-page']}`}>
            <MyJobMetaData
                title="Candidate Profile | RoleCrest"
                description="Build and manage your verified candidate profile, skills, work experience, and resume on RoleCrest."
            />

            {/* Breadcrumb Header */}
            <div className={styles['header-row']}>
                <div className={styles['title-group']}>
                    <div className={styles['badge-tag']}>
                        <span className={styles['pulse-indicator']} />
                        <span>CANDIDATE TALENT PROFILE</span>
                    </div>
                    <h1 className={styles['page-title']}>Your Professional Profile</h1>
                    <p className={styles['page-subtitle']}>
                        Complete your details once. Apply to verified tech roles with 1-click credential sync.
                    </p>
                </div>

                <div className={styles['action-buttons']}>
                    <button
                        type="button"
                        className={styles['autofill-btn']}
                        onClick={() => setIsResumeModalOpen(true)}
                    >
                        <span className={styles['btn-icon']}>📄</span>
                        <span>Autofill via Resume</span>
                    </button>

                    <button
                        type="button"
                        className={styles['linkedin-btn']}
                        onClick={() => setIsLinkedInModalOpen(true)}
                    >
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="#0A66C2">
                            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                        </svg>
                        <span>Sync with LinkedIn</span>
                    </button>

                    <button
                        type="button"
                        className={styles['save-btn']}
                        onClick={handleSaveProfile}
                        disabled={isSaving}
                    >
                        <span>{isSaving ? 'Saving...' : 'Save Profile'}</span>
                    </button>
                </div>
            </div>

            {/* Profile Completeness Strip */}
            <div className={styles['completeness-card']}>
                <div className={styles['score-ring-wrapper']}>
                    <div className={styles['score-value']}>{completenessScore}%</div>
                    <div className={styles['score-label']}>Completed</div>
                </div>
                <div className={styles['completeness-details']}>
                    <div className={styles['meter-header']}>
                        <h4>Profile Readiness for Recruiter Matching</h4>
                        <span>
                            {completenessScore >= 80
                                ? '⭐ Top-Tier Candidate Profile'
                                : completenessScore >= 50
                                ? '⚡ Almost Ready to Apply'
                                : '📝 Add Skills & Experience to Boost Visibility'}
                        </span>
                    </div>
                    <div className={styles['progress-track']}>
                        <div
                            className={styles['progress-bar']}
                            style={{ width: `${completenessScore}%` }}
                        />
                    </div>
                    <div className={styles['checklist-row']}>
                        <span className={profile.headline ? styles['checked'] : ''}>
                            {profile.headline ? '✓' : '○'} Headline
                        </span>
                        <span className={profile.skills.length >= 3 ? styles['checked'] : ''}>
                            {profile.skills.length >= 3 ? '✓' : '○'} Skills (3+)
                        </span>
                        <span className={profile.workExperience.length >= 1 ? styles['checked'] : ''}>
                            {profile.workExperience.length >= 1 ? '✓' : '○'} Work Experience
                        </span>
                        <span className={profile.resume ? styles['checked'] : ''}>
                            {profile.resume ? '✓' : '○'} Resume Uploaded
                        </span>
                    </div>
                </div>
            </div>

            {/* Main Form Layout */}
            <form onSubmit={handleSaveProfile} className={styles['profile-grid']}>
                {/* 1. Basic & Contact Information */}
                <div className={styles['card-section']}>
                    <div className={styles['section-header']}>
                        <div className={styles['section-icon']}>👤</div>
                        <div>
                            <h3>Personal & Contact Details</h3>
                            <p>Recruiters will use these details to contact you for interviews.</p>
                        </div>
                    </div>

                    <div className={styles['form-row-2']}>
                        <div className={styles['form-group']}>
                            <label htmlFor="name">Full Name *</label>
                            <input
                                id="name"
                                type="text"
                                value={profile.name}
                                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                placeholder="e.g. Tushar Goswami"
                                required
                            />
                        </div>
                        <div className={styles['form-group']}>
                            <label htmlFor="email">Email Address *</label>
                            <input
                                id="email"
                                type="email"
                                value={profile.email}
                                disabled
                                title="Primary account email is verified"
                            />
                        </div>
                    </div>

                    <div className={styles['form-row-2']}>
                        <div className={styles['form-group']}>
                            <label htmlFor="phone">Phone Number</label>
                            <input
                                id="phone"
                                type="text"
                                value={profile.phone}
                                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                placeholder="e.g. +91 98765 43210"
                            />
                        </div>
                        <div className={styles['form-group']}>
                            <label htmlFor="location">Current Location / City</label>
                            <input
                                id="location"
                                type="text"
                                value={profile.location}
                                onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                                placeholder="e.g. Bangalore, India (or Remote)"
                            />
                        </div>
                    </div>
                </div>

                {/* 2. Professional Headline & Bio */}
                <div className={styles['card-section']}>
                    <div className={styles['section-header']}>
                        <div className={styles['section-icon']}>💼</div>
                        <div>
                            <h3>Headline & Summary</h3>
                            <p>Summarize your domain expertise, seniority, and primary tech stack.</p>
                        </div>
                    </div>

                    <div className={styles['form-group']}>
                        <label htmlFor="headline">Professional Headline *</label>
                        <input
                            id="headline"
                            type="text"
                            value={profile.headline}
                            onChange={(e) => setProfile({ ...profile, headline: e.target.value })}
                            placeholder="e.g. Lead Full-Stack Engineer | Next.js, Distributed Systems & AWS"
                        />
                    </div>

                    <div className={styles['form-group']}>
                        <label htmlFor="bio">Executive Bio / Summary</label>
                        <textarea
                            id="bio"
                            rows={3}
                            value={profile.bio}
                            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                            placeholder="Briefly describe your career accomplishments, architecture background, and preferred tech roles..."
                        />
                    </div>
                </div>

                {/* 3. Job Preferences & Availability */}
                <div className={styles['card-section']}>
                    <div className={styles['section-header']}>
                        <div className={styles['section-icon']}>🎯</div>
                        <div>
                            <h3>Job Preferences & Notice Period</h3>
                            <p>Match with recruiters looking for your specific availability and compensation range.</p>
                        </div>
                    </div>

                    <div className={styles['form-row-3']}>
                        <div className={styles['form-group']}>
                            <label htmlFor="experienceYears">Years of Experience</label>
                            <input
                                id="experienceYears"
                                type="text"
                                value={profile.experienceYears}
                                onChange={(e) => setProfile({ ...profile, experienceYears: e.target.value })}
                                placeholder="e.g. 5"
                            />
                        </div>
                        <div className={styles['form-group']}>
                            <label htmlFor="experienceLevel">Experience Level</label>
                            <select
                                id="experienceLevel"
                                value={profile.experienceLevel}
                                onChange={(e) => setProfile({ ...profile, experienceLevel: e.target.value })}
                            >
                                <option value="Entry-Level">Entry-Level (0-2 yrs)</option>
                                <option value="Mid-Level">Mid-Level (2-5 yrs)</option>
                                <option value="Senior">Senior (5-8 yrs)</option>
                                <option value="Lead / Principal">Lead / Principal (8+ yrs)</option>
                                <option value="Executive">Executive / Director</option>
                            </select>
                        </div>
                        <div className={styles['form-group']}>
                            <label htmlFor="workplacePreference">Workplace Preference</label>
                            <select
                                id="workplacePreference"
                                value={profile.workplacePreference}
                                onChange={(e) => setProfile({ ...profile, workplacePreference: e.target.value })}
                            >
                                <option value="Remote">Remote</option>
                                <option value="Hybrid">Hybrid</option>
                                <option value="On-site">On-site</option>
                            </select>
                        </div>
                    </div>

                    <div className={styles['form-row-2']}>
                        <div className={styles['form-group']}>
                            <label htmlFor="noticePeriod">Notice Period</label>
                            <select
                                id="noticePeriod"
                                value={profile.noticePeriod}
                                onChange={(e) => setProfile({ ...profile, noticePeriod: e.target.value })}
                            >
                                <option value="Immediate">Immediate Joiner</option>
                                <option value="15 Days">15 Days</option>
                                <option value="30 Days">30 Days</option>
                                <option value="60 Days">60 Days</option>
                                <option value="90 Days">90 Days</option>
                            </select>
                        </div>
                        <div className={styles['form-group']}>
                            <label htmlFor="expectedSalary">Expected Compensation Range</label>
                            <input
                                id="expectedSalary"
                                type="text"
                                value={profile.expectedSalary}
                                onChange={(e) => setProfile({ ...profile, expectedSalary: e.target.value })}
                                placeholder="e.g. $140,000 - $170,000 or ₹28,00,000"
                            />
                        </div>
                    </div>
                </div>

                {/* 4. Skills & Proficiencies */}
                <div className={styles['card-section']}>
                    <div className={styles['section-header']}>
                        <div className={styles['section-icon']}>⚡</div>
                        <div>
                            <h3>Key Technical Skills</h3>
                            <p>Add the languages, frameworks, and tools you excel in.</p>
                        </div>
                    </div>

                    <div className={styles['skills-input-row']}>
                        <input
                            type="text"
                            value={newSkill}
                            onChange={(e) => setNewSkill(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleAddSkill(newSkill);
                                }
                            }}
                            placeholder="Type a skill (e.g. Next.js, Docker, MongoDB) and press Enter..."
                        />
                        <button
                            type="button"
                            className={styles['add-skill-btn']}
                            onClick={() => handleAddSkill(newSkill)}
                        >
                            + Add Skill
                        </button>
                    </div>

                    {/* Popular skill quick suggestions */}
                    <div className={styles['popular-skills-wrap']}>
                        <span className={styles['quick-add-label']}>Quick Add:</span>
                        {POPULAR_SKILLS.filter((s) => !profile.skills.includes(s)).map((skill) => (
                            <button
                                key={skill}
                                type="button"
                                className={styles['popular-chip']}
                                onClick={() => handleAddSkill(skill)}
                            >
                                + {skill}
                            </button>
                        ))}
                    </div>

                    {/* Active skill tags */}
                    <div className={styles['active-skills-container']}>
                        {profile.skills.length === 0 ? (
                            <p className={styles['empty-hint']}>No skills added yet. Click &apos;Autofill via Resume&apos; or use the quick tags above.</p>
                        ) : (
                            profile.skills.map((skill) => (
                                <span key={skill} className={styles['skill-pill']}>
                                    <span>{skill}</span>
                                    <button
                                        type="button"
                                        className={styles['remove-pill-btn']}
                                        onClick={() => handleRemoveSkill(skill)}
                                        aria-label={`Remove ${skill}`}
                                    >
                                        ×
                                    </button>
                                </span>
                            ))
                        )}
                    </div>
                </div>

                {/* 5. Work Experience */}
                <div className={styles['card-section']}>
                    <div className={styles['section-header-flex']}>
                        <div className={styles['section-header-left']}>
                            <div className={styles['section-icon']}>🏢</div>
                            <div>
                                <h3>Work Experience</h3>
                                <p>Past employment history, engineering responsibilities, and achievements.</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            className={styles['sub-action-btn']}
                            onClick={() => setShowExpForm(!showExpForm)}
                        >
                            {showExpForm ? 'Cancel' : '+ Add Position'}
                        </button>
                    </div>

                    {/* Inline New Experience Form */}
                    {showExpForm && (
                        <div className={styles['inline-form-box']}>
                            <h4>Add Employment Record</h4>
                            <div className={styles['form-row-2']}>
                                <div className={styles['form-group']}>
                                    <label>Role / Job Title *</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Senior Software Engineer"
                                        value={expDraft.title}
                                        onChange={(e) => setExpDraft({ ...expDraft, title: e.target.value })}
                                    />
                                </div>
                                <div className={styles['form-group']}>
                                    <label>Company / Organization *</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Microsoft"
                                        value={expDraft.company}
                                        onChange={(e) => setExpDraft({ ...expDraft, company: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className={styles['form-row-2']}>
                                <div className={styles['form-group']}>
                                    <label>Start Date</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Jan 2021"
                                        value={expDraft.startDate}
                                        onChange={(e) => setExpDraft({ ...expDraft, startDate: e.target.value })}
                                    />
                                </div>
                                <div className={styles['form-group']}>
                                    <label>End Date</label>
                                    <input
                                        type="text"
                                        placeholder={expDraft.isCurrent ? 'Present' : 'e.g. Dec 2023'}
                                        disabled={expDraft.isCurrent}
                                        value={expDraft.isCurrent ? 'Present' : expDraft.endDate}
                                        onChange={(e) => setExpDraft({ ...expDraft, endDate: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className={styles['checkbox-group']}>
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={expDraft.isCurrent}
                                        onChange={(e) =>
                                            setExpDraft({
                                                ...expDraft,
                                                isCurrent: e.target.checked,
                                                endDate: e.target.checked ? 'Present' : '',
                                            })
                                        }
                                    />
                                    <span>I currently work in this role</span>
                                </label>
                            </div>
                            <div className={styles['form-group']}>
                                <label>Responsibilities & Highlights</label>
                                <textarea
                                    rows={2}
                                    placeholder="Key technical accomplishments, architecture contributions..."
                                    value={expDraft.description}
                                    onChange={(e) => setExpDraft({ ...expDraft, description: e.target.value })}
                                />
                            </div>
                            <div className={styles['inline-form-actions']}>
                                <button type="button" className={styles['confirm-btn']} onClick={handleAddExperience}>
                                    Save Position
                                </button>
                                <button type="button" className={styles['cancel-btn']} onClick={() => setShowExpForm(false)}>
                                    Discard
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Existing Experience Items */}
                    <div className={styles['items-list']}>
                        {profile.workExperience.length === 0 ? (
                            <p className={styles['empty-hint']}>No work experience listed yet.</p>
                        ) : (
                            profile.workExperience.map((exp, idx) => (
                                <div key={idx} className={styles['item-card']}>
                                    <div className={styles['item-main']}>
                                        <div className={styles['item-title']}>{exp.title}</div>
                                        <div className={styles['item-subtitle']}>
                                            <span className={styles['company-name']}>{exp.company}</span>
                                            {(exp.startDate || exp.endDate) && (
                                                <span className={styles['date-pill']}>
                                                    {exp.startDate} - {exp.endDate || (exp.isCurrent ? 'Present' : '')}
                                                </span>
                                            )}
                                        </div>
                                        {exp.description && (
                                            <p className={styles['item-desc']}>{exp.description}</p>
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        className={styles['delete-item-btn']}
                                        onClick={() => handleRemoveExperience(idx)}
                                        title="Delete position"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* 6. Education */}
                <div className={styles['card-section']}>
                    <div className={styles['section-header-flex']}>
                        <div className={styles['section-header-left']}>
                            <div className={styles['section-icon']}>🎓</div>
                            <div>
                                <h3>Education & Degrees</h3>
                                <p>Colleges, universities, degrees, and graduation years.</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            className={styles['sub-action-btn']}
                            onClick={() => setShowEduForm(!showEduForm)}
                        >
                            {showEduForm ? 'Cancel' : '+ Add Degree'}
                        </button>
                    </div>

                    {showEduForm && (
                        <div className={styles['inline-form-box']}>
                            <h4>Add Education Record</h4>
                            <div className={styles['form-row-2']}>
                                <div className={styles['form-group']}>
                                    <label>Degree / Qualification *</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. B.Tech Computer Science"
                                        value={eduDraft.degree}
                                        onChange={(e) => setEduDraft({ ...eduDraft, degree: e.target.value })}
                                    />
                                </div>
                                <div className={styles['form-group']}>
                                    <label>Institution / University *</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Stanford University"
                                        value={eduDraft.institution}
                                        onChange={(e) => setEduDraft({ ...eduDraft, institution: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className={styles['form-row-2']}>
                                <div className={styles['form-group']}>
                                    <label>Field of Study</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Software Engineering"
                                        value={eduDraft.fieldOfStudy}
                                        onChange={(e) => setEduDraft({ ...eduDraft, fieldOfStudy: e.target.value })}
                                    />
                                </div>
                                <div className={styles['form-group']}>
                                    <label>Graduation Year</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. 2022"
                                        value={eduDraft.endYear}
                                        onChange={(e) => setEduDraft({ ...eduDraft, endYear: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className={styles['inline-form-actions']}>
                                <button type="button" className={styles['confirm-btn']} onClick={handleAddEducation}>
                                    Save Degree
                                </button>
                                <button type="button" className={styles['cancel-btn']} onClick={() => setShowEduForm(false)}>
                                    Discard
                                </button>
                            </div>
                        </div>
                    )}

                    <div className={styles['items-list']}>
                        {profile.education.length === 0 ? (
                            <p className={styles['empty-hint']}>No education entries added yet.</p>
                        ) : (
                            profile.education.map((edu, idx) => (
                                <div key={idx} className={styles['item-card']}>
                                    <div className={styles['item-main']}>
                                        <div className={styles['item-title']}>{edu.degree}</div>
                                        <div className={styles['item-subtitle']}>
                                            <span>{edu.institution}</span>
                                            {edu.endYear && <span className={styles['date-pill']}>{edu.endYear}</span>}
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        className={styles['delete-item-btn']}
                                        onClick={() => handleRemoveEducation(idx)}
                                        title="Delete degree"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* 7. Social & Professional Links */}
                <div className={styles['card-section']}>
                    <div className={styles['section-header']}>
                        <div className={styles['section-icon']}>🌐</div>
                        <div>
                            <h3>Portfolio & Professional Links</h3>
                            <p>Share your GitHub projects, LinkedIn profile, or personal engineering blog.</p>
                        </div>
                    </div>

                    <div className={styles['form-row-2']}>
                        <div className={styles['form-group']}>
                            <label htmlFor="linkedinLink">LinkedIn Profile URL</label>
                            <input
                                id="linkedinLink"
                                type="url"
                                placeholder="https://linkedin.com/in/username"
                                value={profile.links.linkedin}
                                onChange={(e) =>
                                    setProfile({
                                        ...profile,
                                        links: { ...profile.links, linkedin: e.target.value },
                                    })
                                }
                            />
                        </div>
                        <div className={styles['form-group']}>
                            <label htmlFor="githubLink">GitHub Profile URL</label>
                            <input
                                id="githubLink"
                                type="url"
                                placeholder="https://github.com/username"
                                value={profile.links.github}
                                onChange={(e) =>
                                    setProfile({
                                        ...profile,
                                        links: { ...profile.links, github: e.target.value },
                                    })
                                }
                            />
                        </div>
                    </div>

                    <div className={styles['form-row-2']}>
                        <div className={styles['form-group']}>
                            <label htmlFor="portfolioLink">Portfolio / Personal Website</label>
                            <input
                                id="portfolioLink"
                                type="url"
                                placeholder="https://yourportfolio.dev"
                                value={profile.links.portfolio}
                                onChange={(e) =>
                                    setProfile({
                                        ...profile,
                                        links: { ...profile.links, portfolio: e.target.value },
                                    })
                                }
                            />
                        </div>
                        <div className={styles['form-group']}>
                            <label htmlFor="twitterLink">Twitter / X Profile</label>
                            <input
                                id="twitterLink"
                                type="url"
                                placeholder="https://x.com/username"
                                value={profile.links.twitter}
                                onChange={(e) =>
                                    setProfile({
                                        ...profile,
                                        links: { ...profile.links, twitter: e.target.value },
                                    })
                                }
                            />
                        </div>
                    </div>
                </div>

                {/* 8. Attached Resume Badge */}
                {profile.resume && profile.resume.fileName && (
                    <div className={styles['resume-status-card']}>
                        <div className={styles['resume-badge-icon']}>📄</div>
                        <div className={styles['resume-badge-info']}>
                            <div className={styles['resume-file-name']}>{profile.resume.fileName}</div>
                            <div className={styles['resume-file-meta']}>
                                Formatted as {profile.resume.fileType?.toUpperCase()} • Uploaded on{' '}
                                {profile.resume.uploadedAt
                                    ? new Date(profile.resume.uploadedAt).toLocaleDateString()
                                    : 'Recently'}
                            </div>
                        </div>
                        <button
                            type="button"
                            className={styles['replace-resume-btn']}
                            onClick={() => setIsResumeModalOpen(true)}
                        >
                            Update Resume
                        </button>
                    </div>
                )}

                {/* Sticky Bottom Save Bar */}
                <div className={styles['bottom-save-bar']}>
                    <div className={styles['save-status-hint']}>
                        {completenessScore < 60
                            ? '💡 Tip: Complete your headline and skills to increase interview invites by 3x.'
                            : '✨ Your profile is in top condition for verified recruiter discovery.'}
                    </div>
                    <button
                        type="submit"
                        className={styles['primary-save-button']}
                        disabled={isSaving}
                    >
                        {isSaving ? 'Saving Profile...' : 'Save Profile Changes'}
                    </button>
                </div>
            </form>

            {/* MODAL: Autofill via Resume */}
            {isResumeModalOpen && (
                <div className={styles['modal-overlay']}>
                    <div className={styles['modal-card']}>
                        <div className={styles['modal-header']}>
                            <h3>📄 Autofill via Resume Document</h3>
                            <button
                                type="button"
                                className={styles['modal-close-btn']}
                                onClick={() => !isParsingResume && setIsResumeModalOpen(false)}
                            >
                                ✕
                            </button>
                        </div>

                        <p className={styles['modal-desc']}>
                            Upload your resume in any format. Our memory-efficient extraction engine will parse your
                            skills, experience, contact details, and education into your profile in seconds.
                        </p>

                        <div className={styles['supported-formats-pills']}>
                            <span>PDF</span>
                            <span>DOCX</span>
                            <span>DOC</span>
                            <span>PNG</span>
                            <span>JPG</span>
                            <span>TXT</span>
                        </div>

                        <div
                            className={`${styles['dropzone']} ${isParsingResume ? styles['parsing'] : ''}`}
                            onClick={() => !isParsingResume && fileInputRef.current?.click()}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".pdf,.docx,.doc,.png,.jpg,.jpeg,.webp,.txt"
                                style={{ display: 'none' }}
                                onChange={handleResumeUpload}
                                disabled={isParsingResume}
                            />
                            <div className={styles['dropzone-icon']}>
                                {isParsingResume ? '⚙️' : '☁️'}
                            </div>
                            <div className={styles['dropzone-title']}>
                                {isParsingResume ? 'Parsing Document...' : 'Click or Drag Resume Here'}
                            </div>
                            <div className={styles['dropzone-sub']}>
                                {parseFeedback || 'Supports PDF, Word (DOCX/DOC), Images, and TXT up to 8MB'}
                            </div>
                        </div>

                        <div className={styles['modal-footer']}>
                            <button
                                type="button"
                                className={styles['cancel-btn']}
                                onClick={() => setIsResumeModalOpen(false)}
                                disabled={isParsingResume}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL: Connect LinkedIn via OAuth 2.0 */}
            {isLinkedInModalOpen && (
                <div className={styles['modal-overlay']}>
                    <div className={styles['modal-card']}>
                        <div className={styles['modal-header']}>
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <svg viewBox="0 0 24 24" width="22" height="22" fill="#0A66C2">
                                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                                </svg>
                                Connect with LinkedIn
                            </h3>
                            <button
                                type="button"
                                className={styles['modal-close-btn']}
                                onClick={() => setIsLinkedInModalOpen(false)}
                            >
                                ✕
                            </button>
                        </div>

                        <p className={styles['modal-desc']}>
                            Sync your official LinkedIn profile to auto-populate your verified photo, name, and public profile link.
                        </p>

                        <button
                            type="button"
                            className={styles['oauth-action-btn']}
                            onClick={handleInitiateLinkedInOAuth}
                        >
                            <svg viewBox="0 0 24 24">
                                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                            </svg>
                            <span>Authorize with LinkedIn</span>
                        </button>

                        <div className={styles['modal-footer']} style={{ marginTop: '1.25rem' }}>
                            <button
                                type="button"
                                className={styles['cancel-btn']}
                                onClick={() => setIsLinkedInModalOpen(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Toast
                heading={toastType === 'success' ? 'Profile Updated' : 'Notice'}
                message={toastMessage}
                isToastOpen={toastOpen}
                setToastOpen={setToastOpen}
            />
            <Loader isLoading={isLoading} />
        </section>
    );
};

export default ProfilePage;
