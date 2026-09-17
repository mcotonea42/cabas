export type List = {
  id: string;
  name: string;
  createdAt: string;
};

export type Item = {
  id: string;
  name: string;
  quantity: string | null;
  isChecked: boolean;
};

export type Household = {
  id: string;
  name: string;
  inviteCode: string;
  createdAt: string;
};
