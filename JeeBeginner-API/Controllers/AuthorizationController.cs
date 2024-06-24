using JeeAccount.Classes;
using JeeBeginner.Classes;
using JeeBeginner.Models.Common;
using JeeBeginner.Models.User;
using JeeBeginner.Services.Authorization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using System;
using System.Data.SqlClient;
using System.Threading.Tasks;

namespace JeeBeginner.Controllers
{
    [EnableCors("AllowOrigin")]
    [Route("api/authorization")]
    [ApiController]
    public class AuthorizationController : ControllerBase
    {
        private readonly ICustomAuthorizationService _service;
        private readonly string _jwtSecret;
        private readonly string _connectionString;

        public AuthorizationController(ICustomAuthorizationService service, IConfiguration configuration)
        {
            _service = service;
            _jwtSecret = configuration.GetValue<string>("JWT:Secret");
            _connectionString = configuration.GetConnectionString("DefaultConnection");

        }

        [HttpPost]
        [Route("login")]
        [AllowAnonymous]
        public async Task<IActionResult> Authenticate([FromBody] LoginModel model)
        {
            try
            {
                var user = await _service.GetUser(model.Username, model.Password);

                if (user == null)
                    return Unauthorized(new { message = "Username or password invalid" });

                if (user.IsLock)
                    return Unauthorized(new { message = "Username is locked" });

                if (user.Id == -1)
                    return Unauthorized(new { message = "Partner is locked" });

                var token = _service.CreateToken(user);

                return Ok(new
                {
                    user = user,
                    token = token.Result
                });
            }
            catch (KhongCoDuLieuException ex)
            {
                return Unauthorized(MessageReturnHelper.Custom(ex.Message + " không hợp lệ"));
            }
            catch (Exception ex)
            {
                return BadRequest(MessageReturnHelper.Exception(ex));
            }
        }

        [HttpGet]
        [Route("updateLastlogin")]
        public async Task<ActionResult<dynamic>> UpdateLastLogin()
        {
            try
            {
                var user = Ulities.GetUserByHeader(HttpContext.Request.Headers, _jwtSecret);
                if (user == null) return StatusCode(401);

                var data = await _service.UpdateLastLogin(user.Id);
                if (!data.Susscess)
                {
                    return StatusCode(400);
                }

                return StatusCode(200);
            }
            catch (KhongCoDuLieuException ex)
            {
                return Unauthorized(MessageReturnHelper.Custom(ex.Message + " không hợp lệ"));
            }
            catch (Exception ex)
            {
                return BadRequest(MessageReturnHelper.Exception(ex));
            }
        }




        [HttpPost]
        [Route("changePassword")]
        public async Task<ActionResult<dynamic>> changePassword([FromBody] ChangePasswordModel model)
        {
            try
            {
                var user = Ulities.GetUserByHeader(HttpContext.Request.Headers, _jwtSecret);
                if (user == null) return StatusCode(401);
                if (string.IsNullOrEmpty(model.Username))
                {
                    model.Username = user.Username;
                }
                var getUSer = await _service.GetUser(model.Username, model.PasswordOld);
                if (getUSer == null) return (400, "Tài khoản hoặc mật khẩu cũ không hợp lệ");
                _service.ChangePassword(model);
                return StatusCode(200, new { message = "Thành công" });
            }
            catch (KhongCoDuLieuException ex)
            {
                return Unauthorized(MessageReturnHelper.Custom(ex.Message + " không hợp lệ"));
            }
            catch (Exception ex)
            {
                return BadRequest(MessageReturnHelper.Exception(ex));
            }
        }
[HttpGet("{username}")]
public async Task<IActionResult> GetAccountPermit(string username)
{
    try
    {
        // Kết nối đến cơ sở dữ liệu
        using (SqlConnection connection = new SqlConnection(_connectionString))
        {
            await connection.OpenAsync();

            // Tạo và thực thi truy vấn SQL
            string query = "SELECT Username, Id_Permit FROM tbl_account_permit WHERE Username = @username";
            using (SqlCommand command = new SqlCommand(query, connection))
            {
                command.Parameters.AddWithValue("@username", username);

                using (SqlDataReader reader = await command.ExecuteReaderAsync())
                {
                    // Kiểm tra xem có bản ghi nào được trả về không
                    if (reader.HasRows)
                    {
                        // Đọc dữ liệu từ SqlDataReader và tạo đối tượng JSON để trả về
                        await reader.ReadAsync();
                        var result = new
                        {
                            Username = reader.GetString(0),
                            Id_Permit = reader.GetInt32(1)
                        };

                        return Ok(result);
                    }
                    else
                    {
                        // Trường hợp không có bản ghi nào phù hợp
                        return NotFound("No records found for the given username.");
                    }
                }
            }
        }
    }
    catch (Exception ex)
    {
        // Xử lý ngoại lệ và trả về lỗi 500 nếu có lỗi xảy ra trong quá trình thực thi
        return StatusCode(500, $"An error occurred: {ex.Message}");
    }
}
        [HttpGet]
        [Route("api/authorization/getrules")]
        public async Task<IActionResult> GetRules(string username)
        {
            if (string.IsNullOrEmpty(username))
                return BadRequest("Username is required.");

            try
            {
                var userRules = _service.GetRules(username);

                if (userRules == null)
                    return NotFound();

                return Ok(userRules);
            }
            catch (Exception ex)
            {
                // Xử lý lỗi nếu có
                return StatusCode(500, ex.Message);
            }

        }
    }
}