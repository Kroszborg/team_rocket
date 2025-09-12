export class ValidationError extends Error {
  constructor(
    message: string,
    public details: Array<{ path: string; message: string }>
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class SimulationError extends Error {
  constructor(message: string, public campaignId?: string) {
    super(message);
    this.name = 'SimulationError';
  }
}

export const handleError = (error: unknown) => {
  console.error('API Error:', error);
  
  if (error instanceof ValidationError) {
    return {
      success: false,
      error: 'Validation failed',
      details: error.details,
      status: 400,
    };
  }
  
  if (error instanceof NotFoundError) {
    return {
      success: false,
      error: error.message,
      status: 404,
    };
  }
  
  if (error instanceof SimulationError) {
    return {
      success: false,
      error: 'Failed to run campaign simulation',
      campaignId: error.campaignId,
      status: 500,
    };
  }
  
  return {
    success: false,
    error: error instanceof Error ? error.message : 'An unexpected error occurred',
    timestamp: new Date().toISOString(),
    status: 500,
  };
};