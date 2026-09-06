export interface PromptPreset {
  id: string;
  title: string;
  idea: string;
  tag: string;
}

export interface MasterPromptSection {
  num: string;
  title: string;
  content: string;
}

export interface GeneratedPrompt {
  idea: string;
  sections: MasterPromptSection[];
}
