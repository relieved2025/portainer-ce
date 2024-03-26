import { PropsWithChildren, useEffect, useState } from 'react';
import { useRouter } from '@uirouter/react';
import { Trans, useTranslation } from 'react-i18next';

import { Widget, WidgetBody } from '@@/Widget';
import { FormControl } from '@@/form-components/FormControl';
import { Button } from '@@/buttons';
import { FormSectionTitle } from '@@/form-components/FormSectionTitle';
import { TextTip } from '@@/Tip/TextTip';
import { Code } from '@@/Code';
import { CopyButton } from '@@/buttons/CopyButton';
import { Input } from '@@/form-components/Input';

interface AccessTokenResponse {
  rawAPIKey: string;
}

export interface Props {
  // onSubmit dispatches a successful matomo analytics event
  onSubmit: (description: string) => Promise<AccessTokenResponse>;

  // onError is called when an error occurs; this is a callback to Notifications.error
  onError: (heading: string, err: unknown, message: string) => void;
}

export function CreateAccessToken({
  onSubmit,
  onError,
}: PropsWithChildren<Props>) {
  const translationNS = 'account.accessTokens.create';
  const { t } = useTranslation(translationNS);

  const router = useRouter();
  const [description, setDescription] = useState('');
  const [errorText, setErrorText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [accessToken, setAccessToken] = useState('');

  useEffect(() => {
    if (description.length === 0) {
      setErrorText(t('此字段为必填项'));
    } else setErrorText('');
  }, [description, t]);

  async function generateAccessToken() {
    if (isLoading) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await onSubmit(description);
      setAccessToken(response.rawAPIKey);
    } catch (err) {
      onError('失败', err, '生成访问令牌失败');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Widget>
      <WidgetBody>
        <div className="form-horizontal">
          <FormControl
            inputId="input"
            label={t('描述')}
            errors={errorText}
          >
            <Input
              id="input"
              onChange={(e) => setDescription(e.target.value)}
              value={description}
            />
          </FormControl>
          <div className="row mt-5">
            <Button
              disabled={!!errorText || !!accessToken}
              onClick={() => generateAccessToken()}
            >
              {t('添加访问令牌')}
            </Button>
          </div>
        </div>
        {accessToken && (
          <div className="mt-5">
            <FormSectionTitle>
              <Trans ns={translationNS}>新访问令牌</Trans>
            </FormSectionTitle>
            <TextTip>
              <Trans ns={translationNS}>
                请复制新的访问令牌。您将无法再次查看该令牌。
              </Trans>
            </TextTip>
            <Code>{accessToken}</Code>
            <div className="mt-2">
              <CopyButton copyText={accessToken}>
                <Trans ns={translationNS}>复制访问令牌</Trans>
              </CopyButton>
            </div>
            <hr />
            <Button
              type="button"
              onClick={() => router.stateService.go('portainer.account')}
            >
              <Trans ns={translationNS}>完成</Trans>
            </Button>
          </div>
        )}
      </WidgetBody>
    </Widget>
  );
}
