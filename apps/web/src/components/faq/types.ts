export interface FaqItem {
  question: string;
  answer: string;
}

export interface FaqCategory {
  key: string;
  title: string;
  items: FaqItem[];
}
