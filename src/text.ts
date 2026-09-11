/**
 * Everything the typing page can ask you to type. Two shapes, because the two
 * drills are different: loose words train the hands, a passage trains the
 * rhythm of real sentences — capitals, commas, and the pause at a full stop.
 */

/**
 * Common English words, lower-case and unpunctuated on purpose: this drill is
 * about the motion between keys, and a stray apostrophe turns it into a
 * spelling test. Short words dominate, which is what ordinary prose looks like.
 */
export const WORDS: string[] = [
  "the", "be", "of", "and", "to", "in", "have", "it", "that", "for",
  "they", "with", "as", "not", "on", "she", "at", "by", "this", "we",
  "you", "do", "but", "from", "or", "which", "one", "would", "all", "will",
  "there", "say", "who", "make", "when", "can", "more", "if", "no", "out",
  "other", "so", "what", "time", "up", "go", "about", "than", "into", "could",
  "state", "only", "new", "year", "some", "take", "come", "these", "know", "see",
  "use", "get", "like", "then", "first", "any", "work", "now", "may", "such",
  "give", "over", "think", "most", "even", "find", "day", "also", "after", "way",
  "many", "must", "look", "before", "great", "back", "through", "long", "where", "much",
  "should", "well", "people", "down", "own", "just", "because", "good", "each", "those",
  "feel", "seem", "how", "high", "too", "place", "little", "world", "very", "still",
  "hand", "old", "life", "tell", "write", "become", "here", "show", "house", "both",
  "between", "need", "mean", "call", "under", "last", "right", "move", "thing", "school",
  "never", "same", "another", "begin", "while", "number", "part", "turn", "real", "leave",
  "might", "want", "point", "form", "off", "child", "few", "small", "since", "against",
  "ask", "late", "home", "large", "person", "end", "open", "public", "follow", "during",
  "present", "without", "again", "hold", "around", "head", "word", "problem", "however", "lead",
  "system", "set", "order", "eye", "plan", "run", "keep", "face", "fact", "group",
  "play", "stand", "early", "course", "change", "help", "line", "light", "field", "water",
  "read", "hard", "near", "night", "walk", "white", "start", "hear", "close", "book",
  "story", "sound", "learn", "slow", "quiet", "clear", "build", "reach", "carry", "watch",
];

export interface Passage {
  /** Shown under the text while you type it, so the source has a name. */
  title: string;
  body: string;
}

/**
 * Five short passages, written for this page rather than quoted, so there is
 * nothing here to attribute. Each one stays inside the punctuation an ordinary
 * keyboard reaches without a modifier: commas, full stops, and apostrophes.
 */
export const PASSAGES: Passage[] = [
  {
    title: "On a quiet keyboard",
    body:
      "A good keyboard is a quiet one. You stop noticing the keys and start " +
      "noticing the words, and the gap between the thought and the line on " +
      "the screen gets thin enough to forget about. That is the whole trick, " +
      "and it takes nothing but repetition: the same letters, over and over, " +
      "until your hands stop asking where they are.",
  },
  {
    title: "The early hour",
    body:
      "The best hour of the morning is the one nobody else knows about. The " +
      "street is still empty, the light is thin and blue, and the only sound " +
      "is a kettle somewhere in the building. Work started then has a way of " +
      "going well, as if the day has not yet made up its mind to be difficult.",
  },
  {
    title: "What a program is",
    body:
      "Every program is a small argument about how the world is shaped. You " +
      "name the parts, you say how they move, and then you find out what you " +
      "got wrong. The finding out is the job. The typing is only how the " +
      "argument gets written down, one careful line after another.",
  },
  {
    title: "Patience, at the shore",
    body:
      "The sea does the same thing all day and never looks bored. It comes up " +
      "the sand, holds for a moment, and slides back out, and by evening the " +
      "whole beach has been rearranged. Patience is not sitting still. It is " +
      "doing the small thing again, and then again, until the shape of it " +
      "changes.",
  },
  {
    title: "Speed is a side effect",
    body:
      "Nobody gets faster by trying to be fast. They get faster by making " +
      "fewer mistakes, and the mistakes go away when the motion stops being a " +
      "decision. Slow down until the errors stop, then let the pace come back " +
      "on its own. It always does, and it arrives without being asked.",
  },
];
