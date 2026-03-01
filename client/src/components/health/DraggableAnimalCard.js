import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import AnimalCard from './AnimalCard';

const DraggableAnimalCard = ({ animal, canDrag }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging
  } = useDraggable({
    id: animal.id.toString(),
    disabled: !canDrag
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    cursor: canDrag ? 'grab' : 'pointer'
  };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <AnimalCard animal={animal} isDragging={isDragging} />
    </div>
  );
};

export default DraggableAnimalCard;
