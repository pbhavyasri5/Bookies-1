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
import { ChangePasswordForm } from './ChangePasswordForm';

interface SidebarNavProps {
  isAdmin: boolean;
  userEmail: string;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  books: any[];
  onUpdateBook?: (book: any) => void;
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
  onUpdateBook 
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
          <AccordionItem value="account">
            <AccordionTrigger>Account Settings</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 py-2">
                <ChangePasswordForm
                  email={userEmail}
                  onSuccess={() => {
                    // You can add success handling here
                  }}
                />
              </div>
            </AccordionContent>
          </AccordionItem>

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
                <MyBooks userEmail={userEmail} />
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
      </div>
    </ScrollArea>
  );
}