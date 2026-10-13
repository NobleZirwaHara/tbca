<?php

namespace App\Support\Integrations\Zoho;

use App\Support\Integrations\Zoho\Apps\Books;
use App\Support\Integrations\Zoho\Apps\Creator;
use App\Support\Integrations\Zoho\Apps\Crm;
use App\Support\Integrations\Zoho\Apps\Desk;
use App\Support\Integrations\Zoho\Apps\Flow;
use App\Support\Integrations\Zoho\Apps\Projects;
use App\Support\Integrations\Zoho\Apps\WorkDrive;

/** Entry point to the app wrappers: Zoho::crm()->upsertAccount(...). */
class Zoho
{
    public static function crm(): Crm
    {
        return app(Crm::class);
    }

    public static function books(): Books
    {
        return app(Books::class);
    }

    public static function desk(): Desk
    {
        return app(Desk::class);
    }

    public static function projects(): Projects
    {
        return app(Projects::class);
    }

    public static function workdrive(): WorkDrive
    {
        return app(WorkDrive::class);
    }

    public static function creator(): Creator
    {
        return app(Creator::class);
    }

    public static function flow(): Flow
    {
        return app(Flow::class);
    }
}
