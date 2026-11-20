export type TheoryVariant = "A" | "B" | "C";

export interface TheorySection {
  heading: string;
  body: string;
  tips?: string[];
}

export interface FoundationArticle {
  id: string;
  slug: string;
  title: string;
  summary: string;
  readTime: string;
  sections: TheorySection[];
}

export interface ComebeforePrerequisite {
  id: string;
  behavior: string;
  requires: string[];
  rationale: string;
}

export interface AppendixArticle {
  id: string;
  slug: string;
  title: string;
  category: string;
  summary: string;
  sections: TheorySection[];
}

export interface BehaviorStep {
  step: number;
  title: string;
  criteria: string;
  notes?: string;
}

export interface TheoryBehavior {
  id: string;
  levelId: string;
  name: string;
  summary: string;
  prerequisites: string[];
  theory: string[];
  steps: BehaviorStep[];
}

export interface TheoryLevel {
  id: string;
  number: number;
  title: string;
  focus: string;
  overview: string[];
  behaviors: TheoryBehavior[];
}
