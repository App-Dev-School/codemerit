export class AuthConstants {
    public static readonly PLATFORM = 'platform';
    public static readonly AUTH = 'userData';
    public static readonly CACHE_FULL_PROFILE = "myProfile";
    public static readonly CATEGORIES = 'categories';
    public static readonly SUBJECTS = 'subjects';

    public static DEV_MODE = true;
    public static LOG_ENABLED = true;
    public static SHOW_OTP = false;
    public static APP_SETTINGS = "appSettings";

    public static readonly REGEX_PHONE = '^((\\+91-?)|0)?[0-9]{10}$';
    public static readonly REGEX_URL = '(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?';

    public static readonly CURRENT_ROLE_OPTIONS = [
  { label: 'Pursuing B.E./B.Tech', value: 'student_be_btech' },
  { label: 'Pursuing M.E./M.Tech', value: 'student_me_mtech' },
  { label: 'Pursuing MCA/BCA', value: 'student_mca_bca' },
  { label: 'IT Fresher (Graduate)', value: 'it_fresher' },
  { label: 'Junior Developer (0-2 yrs)', value: 'junior_dev' },
  { label: 'Junior QA/Tester (0-2 yrs)', value: 'junior_qa' },
  { label: 'Frontend Developer (2-5 yrs)', value: 'frontend_dev' },
  { label: 'Backend Developer (2-5 yrs)', value: 'backend_dev' },
  { label: 'Full Stack Developer (2-5 yrs)', value: 'fullstack_dev' },
  { label: 'QA Engineer / Tester (2-5 yrs)', value: 'qa_engineer' },
  { label: 'DevOps Engineer', value: 'devops' },
  { label: 'Data Analyst / Data Scientist', value: 'data_analyst' },
  { label: 'AI/ML Engineer', value: 'ml_engineer' },
  { label: 'Mobile App Developer', value: 'mobile_dev' },
  { label: 'Experienced IT Professional (5+ yrs)', value: 'it_pro' },
  { label: 'IT Manager / Lead', value: 'it_manager' },
  { label: 'Career Switcher (Non-IT to IT)', value: 'career_switch' },
  { label: 'Other', value: 'other' }
];

    public log(msg) {
        console.log("APPDEBUG", msg);
    }
}