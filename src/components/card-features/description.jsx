import { useState } from "react";
import { Button, HStack, Text } from "@chakra-ui/react";

const pageParagraphs = (pageText) => {
  return pageText.split("\n\n");
};

const spellPages = (spell) => {
  const maxLength = 400;
  const pages = [];
  let currentPage = "";

  const splitIntoSentences = (text) => {
    // Split on period followed by space, question mark, or exclamation point
    return text.match(/[^.!?]+[.!?]+\s*/g) || [text];
  };

  spell.desc.forEach((paragraph) => {
    // If paragraph is longer than maxLength, split it into sentences
    if (paragraph.length > maxLength) {
      const sentences = splitIntoSentences(paragraph);
      sentences.forEach((sentence) => {
        if (
          currentPage.length + sentence.length > maxLength &&
          currentPage.length > 0
        ) {
          pages.push(currentPage.trim());
          currentPage = sentence;
        } else {
          currentPage = currentPage ? `${currentPage} ${sentence}` : sentence;
        }
      });
    } else {
      // Handle shorter paragraphs as before
      if (
        currentPage.length + paragraph.length > maxLength &&
        currentPage.length > 0
      ) {
        pages.push(currentPage.trim());
        currentPage = paragraph;
      } else {
        currentPage = currentPage
          ? `${currentPage}\n\n${paragraph}`
          : paragraph;
      }
    }
  });

  if (currentPage) {
    pages.push(currentPage.trim());
  }

  return pages;
};

export function Description({ spell }) {
  const [currentPage, setCurrentPage] = useState(0);
  const pages = spellPages(spell);
  const totalPages = pages.length;

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  return (
    <div className="description">
      {pageParagraphs(pages[currentPage]).map((paragraph, index) => (
        <p key={index}>{paragraph}</p>
      ))}

      {totalPages > 1 && (
        <HStack justify="center" mt={4} spacing={4}>
          <Button
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            isDisabled={currentPage === 0}
          >
            Previous
          </Button>

          <Text>
            Page {currentPage + 1} of {totalPages}
          </Text>

          <Button
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            isDisabled={currentPage === totalPages - 1}
          >
            Next
          </Button>
        </HStack>
      )}
    </div>
  );
}
