import { useI18n } from "../../../i18n";

const VerifyEmailPage: React.FC = () => {
  const { t } = useI18n();
  return <div>{t("Verify email")}</div>;
};

export default VerifyEmailPage;
