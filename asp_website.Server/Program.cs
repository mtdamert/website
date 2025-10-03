using Resend;

WebApplicationBuilder builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add the Resend API Key
IConfiguration appSetting = new ConfigurationBuilder()
        .SetBasePath(Directory.GetCurrentDirectory())
        .AddJsonFile("appsettings.json")
        .Build();
string? apiKey = appSetting.GetValue<string>("RESEND_API_KEY", string.Empty);

builder.Services.AddOptions();
builder.Services.AddHttpClient<ResendClient>();
if (apiKey != null)
{
    builder.Services.Configure<ResendClientOptions>(o =>
    {
        o.ApiToken = apiKey;
    });
}
builder.Services.AddTransient<IResend, ResendClient>();


WebApplication app = builder.Build();

app.UseDefaultFiles();
app.UseStaticFiles();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.MapFallbackToFile("/index.html");

app.Run();
