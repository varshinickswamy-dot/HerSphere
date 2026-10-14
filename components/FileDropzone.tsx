import React, { useCallback, useState } from 'react';
import { Upload, X } from 'lucide-react';
import { Button } from './Button';
import styles from './FileDropzone.module.css';

export interface FileDropzoneProps {
  className?: string;
  accept?: string;
  maxFiles?: number;