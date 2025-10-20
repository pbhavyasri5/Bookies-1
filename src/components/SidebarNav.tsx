import React from 'react';
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ManageBooks } from './ManageBooks';
import { MyBooks } from './MyBooks';
import { Book } from '@/types/book';

interface SidebarNavProps {
  isAdmin: boolean;
  userEmail: string;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  books: Book[];
  onUpdateBook?: (book: Book) => void;
  onReturnBook?: (book: Book) => void;
}

const categories = [
  "All Categories",
  "Fiction",
  "Science",
  "History",
  "Biography",
  "Children",
  "Technology",
  "Art",
  "Philosophy",
  "Mathematics",
  "Literature",
  "Health",
];

export function SidebarNav({ 
  isAdmin, 
  userEmail, 
  selectedCategory, 
  onCategoryChange,
  books,
  onUpdateBook,
  onReturnBook 
}: SidebarNavProps) {
  return (
    <ScrollArea className="h-screen py-6 pl-8 pr-6">
      <div className="space-y-6">
        <div>
          <h3 className="mb-2 text-lg font-semibold">Categories</h3>
          <div className="space-y-1">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => onCategoryChange(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {isAdmin ? (
            <AccordionItem value="manage">
              <AccordionTrigger>Manage Books</AccordionTrigger>
              <AccordionContent>
                <ManageBooks
                  books={books}
                  onUpdateBook={onUpdateBook || (() => {})}
                />
              </AccordionContent>
            </AccordionItem>
          ) : (
            <AccordionItem value="mybooks">
              <AccordionTrigger>My Books</AccordionTrigger>
              <AccordionContent>
                <MyBooks 
                  userEmail={userEmail} 
                  books={books}
                  onReturnBook={onReturnBook}
                />
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
      </div>
    </ScrollArea>
  );
}