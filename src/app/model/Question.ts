import {FileHandle} from './FileHandle';

export interface Question {
  quiz: {};
  content: string;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
  option5: string;
  answer: string;
  questionImages: FileHandle[];
};
