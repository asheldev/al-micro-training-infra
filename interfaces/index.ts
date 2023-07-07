import { FundationsStack } from "../lib/fundations-stack";

export interface StackBasicProps {
  name: string;
  env: string;
  account: string;
  region: string;
}

export interface RootStackProps extends StackBasicProps {
	fundationsStack: FundationsStack;
}
