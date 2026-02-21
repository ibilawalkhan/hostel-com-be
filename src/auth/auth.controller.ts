import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SigninDto, CustomerSignupDto, OwnerSignupDto, WardenFirstTimeLoginDto } from './dto/auth.dto';
import { Public } from './decorators/public.decorator';

@Controller('auth')
@Public() // All auth routes (signin, signup, warden) do not require JWT
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('signup/customer')
  @HttpCode(HttpStatus.CREATED)
  async customerSignup(@Body() signupDto: CustomerSignupDto) {
    return this.authService.customerSignup(signupDto);
  }

  @Post('signup/owner')
  @HttpCode(HttpStatus.CREATED)
  async ownerSignup(@Body() signupDto: OwnerSignupDto) {
    return this.authService.ownerSignup(signupDto);
  }

  @Post('signin')
  @HttpCode(HttpStatus.OK)
  async signin(@Body() signinDto: SigninDto) {
    return this.authService.signin(signinDto);
  }

  @Post('warden/first-time-login')
  @HttpCode(HttpStatus.OK)
  async wardenFirstTimeLogin(@Body() wardenLoginDto: WardenFirstTimeLoginDto) {
    return this.authService.wardenFirstTimeLogin(wardenLoginDto);
  }


}
