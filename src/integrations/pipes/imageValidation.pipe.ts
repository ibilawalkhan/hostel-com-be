import { FileTypeValidator, MaxFileSizeValidator, ParseFilePipe } from "@nestjs/common";

export function imageValidationPipe() {
    return new ParseFilePipe({
        validators: [
            new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB limit
            new FileTypeValidator({ fileType: '.(png|jpeg|jpg|webp|pdf|doc|docx|xls|xlsx|ppt|pptx)' }),
        ],
    });
}


