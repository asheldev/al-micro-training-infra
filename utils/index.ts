export function getCdkPropsFromCustomProps(props: any) {
  return {
    stackName: props.name,
    env: {
      account: props.account,
      region: props.region,
    },
  };
}

const PROJECT_PREFIX = process.env.PROJECT_PREFIX || 'alegra-pets-training';

export function getResourceNameWithPrefix(resourceName: string) {
  return `${PROJECT_PREFIX}-${resourceName}`;
}
