import { DataTransferType, DragEffect } from "@/common/constants/events";
import { useRef, useState, type DragEvent } from "react";

export interface FileDropProps {
  onDragEnter: (event: DragEvent) => void;
  onDragOver: (event: DragEvent) => void;
  onDragLeave: (event: DragEvent) => void;
  onDrop: (event: DragEvent) => void;
}

export interface FileDrop {
  isDropActive: boolean;
  dropProps: FileDropProps;
}

function isFileDrag(event: DragEvent): boolean {
  return Array.from(event.dataTransfer.types).includes(DataTransferType.FILES);
}

export function useFileDrop(
  onFiles: (files: File[]) => void,
  enabled = true,
): FileDrop {
  const depth = useRef(0);
  const [isDropActive, setIsDropActive] = useState(false);

  const reset = () => {
    depth.current = 0;
    setIsDropActive(false);
  };

  return {
    isDropActive,
    dropProps: {
      onDragEnter: (event) => {
        if (!enabled || !isFileDrag(event)) {
          return;
        }

        event.preventDefault();
        depth.current += 1;
        setIsDropActive(true);
      },
      onDragOver: (event) => {
        if (!enabled || !isFileDrag(event)) {
          return;
        }

        event.preventDefault();
        event.dataTransfer.dropEffect = DragEffect.COPY;
      },
      onDragLeave: (event) => {
        if (!enabled || !isFileDrag(event)) {
          return;
        }

        depth.current -= 1;
        if (depth.current <= 0) {
          reset();
        }
      },
      onDrop: (event) => {
        if (!enabled || !isFileDrag(event)) {
          return;
        }

        event.preventDefault();
        reset();

        const files = Array.from(event.dataTransfer.files);
        if (files.length > 0) {
          onFiles(files);
        }
      },
    },
  };
}
