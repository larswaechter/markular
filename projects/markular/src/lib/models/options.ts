export interface Options {
  toolbar: ToolbarOptions;
}

export interface ToolbarOptions {
  headings?: Array<number>;
  emphasis?: {
    bold?: boolean;
    italic?: boolean;
  };
  lists?: {
    ordered?: boolean;
    unordered?: boolean;
  };
  blockquote?: boolean;
  code?: {
    inline?: boolean;
    block?: boolean;
  };
  horizontalRule?: boolean;
  hyperlink?: boolean;
  image?: boolean;
}

export const DefaultOptions: Options = {
  toolbar: {
    headings: [1, 2, 3, 4, 5, 6],
    emphasis: {
      bold: true,
      italic: true,
    },
    lists: {
      ordered: true,
      unordered: true,
    },
    blockquote: true,
    code: {
      inline: true,
      block: true,
    },
    horizontalRule: true,
    hyperlink: true,
    image: true,
  },
};
