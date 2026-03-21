export class ApiResponse {
  static success(data) {
    return {
      success: true,
      data,
      error: null,
    };
  }

  static failure(error) {
    return {
      success: false,
      data: null,
      error,
    };
  }
}
