export type IssueStatus = 'OPEN' | 'INPROGRESS' | 'CLOSED';

export interface Issue {
  id: number;
  kuid: string;
  hostel_kuid: string;
  branch_kuid: string;
  role_kuid: string;
  category_kuid: string;
  priority_kuid: string;
  room_no: string | null;
  title: string;
  description: string | null;
  attachment_url: string | null; // existing DB column: TEXT (single URL)
  status: IssueStatus;
  created_at: Date;
  updated_at: Date;
}

export interface IssueListItem extends Issue {
  issue_number: string; // ISS001 format
  category_name: string;
  priority_name: string;
  hostel_name: string;
  branch_number: string;
  submitted_by: string;
  comment_count: number;
}

export interface IssueComment {
  kuid: string;
  user_kuid: string;
  parent_kuid: string | null;
  comment: string;
  complaint_kuid: string;
  created_at: Date;
  updated_at: Date;
  commenter_name: string;
}

export interface IssueWithComments extends IssueListItem {
  comments: IssueComment[];
}

export interface IssueStats {
  open_count: number;
  inprogress_count: number;
  closed_count: number;
  critical_count: number; // non-closed issues with priority = 'Critical'
}

export interface ResidentHostel {
  hostel_kuid: string;
  hostel_name: string;
}

export interface HostelBranch {
  kuid: string;
  branch_number: string;
}

