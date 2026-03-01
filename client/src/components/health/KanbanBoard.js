import React, { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import { toast } from 'react-toastify';
import { animalsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import AnimalCard from './AnimalCard';
import DroppableColumn from './DroppableColumn';
import './KanbanBoard.css';

const KanbanBoard = ({ animals, onUpdate, type = 'health' }) => {
  const { hasRole } = useAuth();
  const [activeId, setActiveId] = useState(null);
  const canDrag = hasRole('admin', 'staff');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required to start drag
      },
    })
  );

  const areaColumns = [
    { id: 'quarantine', title: 'Quarantine', color: '#F39C12', description: 'Initial intake area' },
    { id: 'under_observation', title: 'Under Observation', color: '#5B7DAD', description: 'Monitoring area' },
    { id: 'in_treatment', title: 'In Treatment', color: '#003D5C', description: 'Treatment area' },
    { id: 'medical_hold', title: 'Medical Hold', color: '#E74C3C', description: 'Critical medical care' },
    { id: 'free_roaming', title: 'Free Roaming', color: '#27AE60', description: 'Animals roaming freely' },
    { id: 'caged', title: 'Caged', color: '#95A5A6', description: 'Animals in cages' }
  ];

  const statusColumns = [
    { id: 'healthy', title: 'Healthy', color: '#27AE60', description: 'Healthy animals' },
    { id: 'stable', title: 'Stable', color: '#5DADE2', description: 'Stable condition' },
    { id: 'treatment', title: 'Treatment', color: '#E67E22', description: 'Under medical treatment' },
    { id: 'on_clinic', title: 'On Clinic (Boarded)', color: '#9B59B6', description: 'Boarded at clinic' },
    { id: 'fostered', title: 'Fostered', color: '#3498DB', description: 'In foster care' },
    { id: 'available_for_adoption', title: 'Available for Adoption', color: '#1ABC9C', description: 'Ready for adoption' },
    { id: 'adopted', title: 'Adopted', color: '#16A085', description: 'Successfully adopted' },
    { id: 'deceased', title: 'Deceased', color: '#7F8C8D', description: 'Deceased animals' }
  ];

  const columns = type === 'status' ? statusColumns : areaColumns;

  const getAnimalsByStatus = (value) => {
    if (type === 'status') {
      return animals.filter(animal => animal.status === value);
    }
    return animals.filter(animal => animal.area === value);
  };

  const handleDragStart = (event) => {
    if (!canDrag) return;
    setActiveId(event.active.id);
  };

  const handleDragEnd = async (event) => {
    if (!canDrag) return;

    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const animalId = active.id;
    const newValue = over.id;

    // Find the animal
    const animal = animals.find(a => a.id === parseInt(animalId));
    if (!animal) return;

    // Check if value hasn't changed
    const currentValue = type === 'status' ? animal.status : animal.area;
    if (currentValue === newValue) return;

    try {
      if (type === 'status') {
        // Update status
        await animalsAPI.updateStatus(animalId, {
          status: newValue,
          area: animal.area,
          notes: `Status changed from ${animal.status} to ${newValue} via Kanban board`
        });
        toast.success(`${animal.name} status updated to ${newValue.replace(/_/g, ' ')}`);
      } else {
        // Update area
        await animalsAPI.updateStatus(animalId, {
          status: animal.status,
          area: newValue,
          notes: `Area changed from ${animal.area} to ${newValue} via Kanban board`
        });
        toast.success(`${animal.name} moved to ${newValue.replace(/_/g, ' ')}`);
      }

      // Refresh data
      onUpdate();
    } catch (error) {
      console.error('Error updating:', error);
      toast.error(error.response?.data?.error || 'Error updating animal');
      // Refresh to revert optimistic update
      onUpdate();
    }
  };

  const activeAnimal = activeId ? animals.find(a => a.id === parseInt(activeId)) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="kanban-board">
        {!canDrag && (
          <div className="read-only-notice">
            <span>👁️ View Only - Only staff and admin can move animals between statuses</span>
          </div>
        )}

        <div className="kanban-columns">
          {columns.map((column) => {
            const columnAnimals = getAnimalsByStatus(column.id);

            return (
              <DroppableColumn
                key={column.id}
                column={column}
                animals={columnAnimals}
                canDrag={canDrag}
              />
            );
          })}
        </div>
      </div>

      <DragOverlay>
        {activeAnimal ? (
          <div style={{ cursor: 'grabbing' }}>
            <AnimalCard animal={activeAnimal} isDragging={true} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default KanbanBoard;
