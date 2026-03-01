import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import DraggableAnimalCard from './DraggableAnimalCard';

const DroppableColumn = ({ column, animals, canDrag }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id
  });

  return (
    <div
      ref={setNodeRef}
      className={`kanban-column ${isOver ? 'drag-over' : ''}`}
      style={{ borderTopColor: column.color }}
    >
      <div className="column-header">
        <h3 className="column-title">{column.title}</h3>
        <span className="column-count">{animals.length}</span>
      </div>

      <div className="column-content">
        {animals.length === 0 ? (
          <div className="empty-column">
            <p>No animals in this {column.title.toLowerCase()}</p>
          </div>
        ) : (
          animals.map((animal) => (
            <DraggableAnimalCard
              key={animal.id}
              animal={animal}
              canDrag={canDrag}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default DroppableColumn;
